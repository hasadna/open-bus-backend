import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brotliCompressSync } from 'node:zlib';
import sinon from 'sinon';

import { dates, ingest, snapshotKey, validateDocument } from '../src/db/ingest-siri.ts';

const fixture = {
  Siri: {
    ServiceDelivery: {
      Status: 'true',
      StopMonitoringDelivery: [
        {
          Status: 'true',
          MonitoredStopVisit: [
            {
              RecordedAtTime: '2026-11-15T14:00:06+02:00',
              MonitoredVehicleJourney: {
                LineRef: '36017',
                FramedVehicleJourneyRef: { DataFrameRef: '2026-11-15', DatedVehicleJourneyRef: '585137124' },
                OperatorRef: '16',
                OriginAimedDepartureTime: '2026-11-15T13:40:00+02:00',
                VehicleLocation: { Longitude: '35.238998', Latitude: '31.781496' },
                Bearing: '166',
                Velocity: '11',
                VehicleRef: '44981602',
                MonitoredCall: { StopPointRef: '434', Order: '14', DistanceFromStop: '6161' },
              },
            },
          ],
        },
      ],
    },
  },
};

describe('SIRI ingestion input', () => {
  it('expands inclusive UTC ranges over leap days and years', () => {
    assert.deepEqual(dates({ from: '2024-02-28', to: '2024-03-01' }), ['2024-02-28', '2024-02-29', '2024-03-01']);
    assert.deepEqual(dates({ from: '2025-12-31', to: '2026-01-01' }), ['2025-12-31', '2026-01-01']);
    assert.deepEqual(dates({ date: '2026-11-15' }), ['2026-11-15']);
    assert.equal(snapshotKey('2026-11-15', 1439), '2026/11/15/23/59.br');
  });
  it('rejects invalid, ambiguous and reversed dates', () => {
    for (const input of [
      {},
      { date: '2026-02-29' },
      { date: '2026-1-01' },
      { date: '2026-01-01', from: '2026-01-01' },
      { from: '2026-11-16', to: '2026-11-15' },
    ])
      assert.throws(() => dates(input));
  });
  it('rejects failed, malformed and timezone-free documents', () => {
    validateDocument(JSON.stringify(fixture));
    // The public archive contains observations without a VehicleLocation.
    const withoutLocation = structuredClone(fixture);
    delete withoutLocation.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.VehicleLocation;
    validateDocument(JSON.stringify(withoutLocation));
    assert.throws(() => validateDocument('{}'));
    const bad = structuredClone(fixture);
    bad.Siri.ServiceDelivery.Status = 'false';
    assert.throws(() => validateDocument(JSON.stringify(bad)));
    const naive = structuredClone(fixture);
    naive.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].RecordedAtTime = '2026-11-15T12:00:00';
    assert.throws(() => validateDocument(JSON.stringify(naive)));
  });
});

const integration = process.env.RUN_CLICKHOUSE_TESTS === '1' ? describe : describe.skip;
integration('SIRI ingestion on ClickHouse', function () {
  this.timeout(60000);
  const originalFetch = globalThis.fetch;
  let previous;
  let database;
  let mode = 'ok';
  let replaceReplyLost = false;
  async function sql(query) {
    const url = new URL(process.env.CLICKHOUSE_URL);
    url.searchParams.set('database', database);
    const response = await originalFetch(url, {
      method: 'POST',
      body: query,
      headers: {
        'X-ClickHouse-User': process.env.CLICKHOUSE_USER,
        'X-ClickHouse-Key': process.env.CLICKHOUSE_PASSWORD,
      },
    });
    const body = await response.text();
    assert.equal(response.status, 200, body);
    return body.trim();
  }
  before(async () => {
    previous = { ...process.env };
    database = `test_siri_${Date.now()}`;
    const target = database;
    database = 'default';
    await sql(`CREATE DATABASE ${target} ENGINE = Atomic`);
    database = target;
    process.env.CLICKHOUSE_DB = database;
    const migration = await readFile(new URL('../chkit/migrations/20261115215925_init.sql', import.meta.url), 'utf8');
    const table = migration.match(/CREATE TABLE IF NOT EXISTS default\.siri_vehicle_location\n[\s\S]*?COMMENT 'Raw SIRI[^']*';/)[0];
    await sql(table.replace('default.siri_vehicle_location', `${database}.siri_vehicle_location`));
    const insert = (await readFile(new URL('../src/db/sql/ingest-siri.sql', import.meta.url), 'utf8'))
      .replaceAll('{database:Identifier}', database)
      .replaceAll('{table:Identifier}', 'siri_vehicle_location')
      .replaceAll('{snapshot:String}', "'2026/11/14/00/00.br'");
    await sql(insert + '\n' + JSON.stringify(fixture));
    const upgrade = await readFile(new URL('../chkit/migrations/20261116095007_siri_daily_partitions.sql', import.meta.url), 'utf8');
    for (const statement of upgrade
      .replaceAll('default.', `${database}.`)
      .replace(/^--.*$/gm, '')
      .split(/;\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean))
      await sql(statement);
    sinon.stub(console, 'warn');
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    sinon.stub(globalThis, 'fetch').callsFake(async (url, options) => {
      if (String(url).includes('openbus-stride-public.s3')) {
        if (!String(url).endsWith('/00/00.br')) return new Response('', { status: 404 });
        if (mode === 'failure') return new Response('', { status: 503 });
        if (mode === 'corrupt') return new Response('broken');
        if (mode === 'missing') return new Response('', { status: 404 });
        return new Response(brotliCompressSync(JSON.stringify(fixture)));
      }
      const response = await originalFetch(url, options);
      if (replaceReplyLost && new URL(url).searchParams.get('query').includes('REPLACE PARTITION')) {
        replaceReplyLost = false;
        await response.text();
        throw new Error('Lost replacement acknowledgement');
      }
      return response;
    });
  });
  after(async () => {
    sinon.restore();
    const target = database;
    database = 'default';
    await sql(`DROP DATABASE IF EXISTS ${target} SYNC`);
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  });
  it('refreshes repeatedly and concurrently without duplicates, preserving other days', async () => {
    await ingest(['2026-11-15', '2026-11-16']);
    await ingest(['2026-11-15']);
    await Promise.all([ingest(['2026-11-15']), ingest(['2026-11-15'])]);
    assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '3');
    assert.equal(
      await sql('SELECT toUnixTimestamp(recorded_at_time) FROM siri_vehicle_location LIMIT 1'),
      String(Date.parse('2026-11-15T12:00:06Z') / 1000),
    );
    assert.equal(await sql('SELECT journey_ref FROM siri_vehicle_location LIMIT 1'), '2026-11-15-585137124');
  });
  it('preserves live data on download failure, corrupt input and an empty day', async () => {
    for (mode of ['failure', 'corrupt', 'missing']) {
      await assert.rejects(ingest(['2026-11-15']));
      assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '3');
    }
    mode = 'ok';
  });
  it('recovers after a committed replacement acknowledgement is lost', async () => {
    replaceReplyLost = true;
    await assert.rejects(ingest(['2026-11-15']));
    await ingest(['2026-11-15']);
    assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '3');
    assert.equal(await sql("SELECT count() FROM system.tables WHERE database = currentDatabase() AND startsWith(name, 'siri_ingest_')"), '0');
  });
});
