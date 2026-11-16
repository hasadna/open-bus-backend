import { ClickHouseConnection } from '@hypequery/clickhouse';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { brotliCompressSync } from 'node:zlib';
import sinon from 'sinon';

import { dates, ingest, sourceUrl } from '../src/db/ingest-siri.ts';

describe('SIRI ingestion input', () => {
  it('expands inclusive UTC ranges over leap days and years', () => {
    assert.deepEqual(dates(['2024-02-28', '2024-03-01']), ['2024-02-28', '2024-02-29', '2024-03-01']);
    assert.deepEqual(dates(['2025-12-31', '2026-01-01']), ['2025-12-31', '2026-01-01']);
    assert.deepEqual(dates(['2026-11-15']), ['2026-11-15']);
    assert.deepEqual(dates(['2026-11-15', '2026-11-15']), ['2026-11-15']);
    assert.equal(
      sourceUrl('2026-11-15'),
      'https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/2026/11/15/{00..23}/{00..59}.br',
    );
  });
  it('rejects invalid, ambiguous and reversed dates', () => {
    for (const input of [
      [],
      ['2026-02-29'],
      ['2026-1-01'],
      ['2026-01-01', '2026-01-02', '2026-01-03'],
      ['2026-11-16', '2026-11-15'],
      ['2026-11-15', ''],
    ])
      assert.throws(() => dates(input));
  });
  it('submits one SQL query per date and continues past a failed date', async () => {
    const previous = { ...process.env };
    Object.assign(process.env, {
      CLICKHOUSE_URL: 'http://clickhouse.test:8123',
      CLICKHOUSE_DB: 'default',
      CLICKHOUSE_USER: 'test',
      CLICKHOUSE_PASSWORD: '',
    });
    const log = sinon.stub(console, 'log');
    const error = sinon.stub(console, 'error');
    const command = sinon.stub();
    command.onFirstCall().rejects(new Error('broken file'));
    command.onSecondCall().resolves({ query_id: 'second-date' });
    const close = sinon.stub().resolves();
    const initialize = sinon.stub(ClickHouseConnection, 'initialize').returns({ getClient: () => ({ command, close }) });
    try {
      await assert.rejects(ingest(['2026-11-11', '2026-11-12']), /1 day\(s\) failed/);
      assert.equal(initialize.firstCall.args[0].session_id, 'openbus_siri_ingest_default');
      assert.equal(initialize.firstCall.args[0].request_timeout, 3600000);
      assert.deepEqual(initialize.firstCall.args[0].clickhouse_settings, {
        wait_end_of_query: 1,
        send_progress_in_http_headers: 1,
        http_headers_progress_interval_ms: 10000,
      });
      assert.deepEqual(
        command.getCalls().map((call) => call.args[0].query_params),
        [
          { database: 'default', source_url: sourceUrl('2026-11-11') },
          { database: 'default', source_url: sourceUrl('2026-11-12') },
        ],
      );
      assert.match(command.firstCall.args[0].query, /INSERT INTO \{database:Identifier\}\.siri_vehicle_location/);
      assert.doesNotMatch(command.firstCall.args[0].query, /\b(CREATE|DROP|ALTER) TABLE/);
      assert.equal(log.callCount, 1);
      assert.equal(JSON.parse(error.firstCall.args[0]).day, '2026-11-11');
      assert.equal(close.callCount, 1);
    } finally {
      initialize.restore();
      log.restore();
      error.restore();
      for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
      Object.assign(process.env, previous);
    }
  });
});

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

const integration = process.env.RUN_CLICKHOUSE_TESTS === '1' ? describe : describe.skip;
integration('SIRI SQL on ClickHouse', function () {
  this.timeout(30000);
  let database;
  let server;
  let sourceBase;
  let insert;
  let mode = 'ok';
  const requests = [];
  async function sql(query, params = {}) {
    const url = new URL(process.env.CLICKHOUSE_URL);
    url.searchParams.set('database', database);
    url.searchParams.set('wait_end_of_query', '1');
    for (const [key, value] of Object.entries({ database, ...params })) url.searchParams.set(`param_${key}`, value);
    const response = await fetch(url, {
      method: 'POST',
      body: query,
      headers: { 'X-ClickHouse-User': process.env.CLICKHOUSE_USER, 'X-ClickHouse-Key': process.env.CLICKHOUSE_PASSWORD },
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.text();
    if (!response.ok || /Code: \d+\. DB::Exception/.test(body)) throw new Error(body);
    return body.trim();
  }
  const append = (day, minute) => sql(insert, { source_url: `${sourceBase}${day.replaceAll('-', '/')}/${minute.replace(':', '/')}.br` });
  before(async () => {
    server = createServer((request, response) => {
      requests.push(request.url);
      if (mode === 'failure' || mode === 'missing') {
        response.writeHead(mode === 'failure' ? 403 : 404).end();
        return;
      }
      let payload;
      const document = structuredClone(fixture);
      const service = document.Siri.ServiceDelivery;
      const delivery = service.StopMonitoringDelivery[0];
      const visit = delivery.MonitoredStopVisit[0];
      if (mode === 'service') {
        service.Status = false;
        service.StopMonitoringDelivery = [];
      }
      if (mode === 'delivery') {
        delivery.Status = 'false';
        delivery.MonitoredStopVisit = [];
      }
      if (mode === 'shape') service.StopMonitoringDelivery = {};
      if (mode === 'visits') delivery.MonitoredStopVisit = {};
      if (mode === 'timezone') visit.RecordedAtTime = '2026-11-15T12:00:00';
      if (mode === 'timestamp') visit.MonitoredVehicleJourney.OriginAimedDepartureTime = 'invalidZ';
      if (mode === 'journey') delete visit.MonitoredVehicleJourney.MonitoredCall;
      if (mode === 'coordinates') delete visit.MonitoredVehicleJourney.VehicleLocation;
      if (mode === 'empty') delivery.MonitoredStopVisit = [];
      if (mode === 'two') {
        const second = structuredClone(visit);
        second.MonitoredVehicleJourney.VehicleRef = 'second-vehicle';
        delivery.MonitoredStopVisit.push(second);
      }
      payload = mode === 'json' ? '{broken' : JSON.stringify(document);
      const body = mode === 'corrupt' ? Buffer.from('broken') : brotliCompressSync(payload);
      response.setHeader('Content-Length', body.length);
      response.end(request.method === 'HEAD' ? undefined : body);
    });
    server.listen(0, '0.0.0.0');
    await once(server, 'listening');
    sourceBase = `http://${process.env.CLICKHOUSE_TEST_HTTP_HOST ?? 'host.docker.internal'}:${server.address().port}/bucket/stride-siri-requester/`;
    database = 'default';
    const target = `test_siri_${Date.now()}`;
    await sql(`CREATE DATABASE ${target}`);
    database = target;
    const migration = await readFile(new URL('../chkit/migrations/20261115215925_init.sql', import.meta.url), 'utf8');
    const table = migration.match(/CREATE TABLE IF NOT EXISTS default\.siri_vehicle_location\n[\s\S]*?COMMENT 'Raw SIRI[^']*';/)[0];
    await sql(table.replace('default.siri_vehicle_location', `${database}.siri_vehicle_location`));
    insert = await readFile(new URL('../src/db/sql/ingest-siri.sql', import.meta.url), 'utf8');
    assert.doesNotMatch(insert, /\b(CREATE|DROP|ALTER) TABLE/);
    await append('2026-11-14', '00:00');
  });
  after(async () => {
    const target = database;
    database = 'default';
    try {
      if (target && target !== 'default') await sql(`DROP DATABASE IF EXISTS ${target} SYNC`);
    } finally {
      server?.closeAllConnections();
      if (server?.listening) await new Promise((resolve) => server.close(resolve));
    }
  });
  it('appends files to the existing monthly table with UTC timestamps and aliases', async () => {
    await append('2026-11-15', '00:00');
    await append('2026-11-16', '00:00');
    assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '3');
    assert.equal(await sql('SELECT count(DISTINCT siri_snapshot_id) FROM siri_vehicle_location'), '3');
    assert.ok(requests.some((path) => path.endsWith('/2026/11/15/00/00.br')));
    assert.equal(
      await sql('SELECT toUnixTimestamp(recorded_at_time) FROM siri_vehicle_location LIMIT 1'),
      String(Date.parse('2026-11-15T12:00:06Z') / 1000),
    );
    assert.equal(await sql('SELECT journey_ref FROM siri_vehicle_location LIMIT 1'), '2026-11-15-585137124');
  });
  it('recovers one failed minute without removing previous minutes', async () => {
    for (mode of ['failure', 'missing', 'corrupt', 'json', 'service', 'delivery', 'shape', 'visits', 'timezone', 'timestamp', 'journey']) {
      await assert.rejects(append('2026-11-15', '00:01'));
      assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '3', mode);
    }
    mode = 'ok';
    await append('2026-11-15', '00:01');
    assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '4');
  });
  it('accepts missing coordinates and empty files, and skips repeated imports', async () => {
    mode = 'coordinates';
    await append('2026-11-18', '00:01');
    assert.equal(await sql("SELECT vehicle_location_longitude FROM siri_vehicle_location WHERE siri_snapshot_id = '2026/11/18/00/01'"), '');
    mode = 'empty';
    await append('2026-11-18', '00:02');
    assert.equal(await sql('SELECT count() FROM siri_vehicle_location'), '5');
    mode = 'ok';
    await append('2026-11-19', '00:00');
    await append('2026-11-19', '00:00');
    assert.equal(await sql("SELECT count() FROM siri_vehicle_location WHERE siri_snapshot_id = '2026/11/19/00/00'"), '1');
    assert.equal(await sql('SELECT count() FROM system.tables WHERE database = currentDatabase()'), '1');
  });
  it('expands zero-padded URL ranges inside ClickHouse, like the upstream macro', async () => {
    await sql(insert, { source_url: `${sourceBase}2026/11/20/{00..00}/{00..01}.br` });
    assert.equal(await sql("SELECT count() FROM siri_vehicle_location WHERE startsWith(siri_snapshot_id, '2026/11/20/')"), '2');
    assert.ok(requests.some((path) => path.endsWith('/2026/11/20/00/00.br')));
    assert.ok(requests.some((path) => path.endsWith('/2026/11/20/00/01.br')));
  });
  it('fills missing rows in a partially imported snapshot and then becomes a no-op', async () => {
    await append('2026-11-21', '00:00');
    mode = 'two';
    await append('2026-11-21', '00:00');
    await append('2026-11-21', '00:00');
    assert.equal(await sql("SELECT count() FROM siri_vehicle_location WHERE siri_snapshot_id = '2026/11/21/00/00'"), '2');
    mode = 'ok';
  });
  it('deduplicates against legacy snapshot IDs ending in .br', async () => {
    await sql(
      `INSERT INTO siri_vehicle_location SELECT * REPLACE ('2026/11/22/00/00.br' AS siri_snapshot_id) FROM siri_vehicle_location WHERE siri_snapshot_id = '2026/11/19/00/00'`,
    );
    await append('2026-11-22', '00:00');
    assert.equal(await sql("SELECT count() FROM siri_vehicle_location WHERE startsWith(siri_snapshot_id, '2026/11/22/')"), '1');
  });
  it('skips the overlap between URL ranges while preserving distinct snapshots', async () => {
    await sql(insert, { source_url: `${sourceBase}2026/11/23/00/{00..01}.br` });
    await sql(insert, { source_url: `${sourceBase}2026/11/23/00/{01..02}.br` });
    await sql(insert, { source_url: `${sourceBase}2026/11/23/00/{00..02}.br` });
    assert.equal(
      await sql("SELECT count(), uniqExact(siri_snapshot_id) FROM siri_vehicle_location WHERE startsWith(siri_snapshot_id, '2026/11/23/')"),
      '3\t3',
    );
  });
  it('stores new snapshot IDs without the .br extension', async () => {
    assert.equal(
      await sql(
        "SELECT count() FROM siri_vehicle_location WHERE endsWith(siri_snapshot_id, '.br') AND NOT startsWith(siri_snapshot_id, '2026/11/22/')",
      ),
      '0',
    );
  });
  it('spills a large deduplication join instead of failing at the join size limit', async () => {
    await sql(`INSERT INTO siri_vehicle_location
      SELECT locations.* REPLACE ('2026/11/25/00/00' AS siri_snapshot_id, concat('seed-', toString(seeds.number)) AS vehicle_ref)
      FROM siri_vehicle_location AS locations CROSS JOIN numbers(20000) AS seeds
      WHERE locations.siri_snapshot_id = '2026/11/19/00/00'`);
    const spills = () => sql("SELECT coalesce(sum(value), 0) FROM system.events WHERE event = 'ExternalJoinWritePart'");
    const before = Number(await spills());
    // With the old setting this becomes a 64 KiB hard cap and raises Code 191.
    // The corrected setting spills a much larger right side to ClickHouse temp storage.
    const smallJoin = insert.replaceAll('268435456', '65536');
    const params = { source_url: `${sourceBase}2026/11/25/00/00.br` };
    await sql(smallJoin, params);
    await sql(smallJoin, params);
    assert.equal(await sql("SELECT count() FROM siri_vehicle_location WHERE startsWith(siri_snapshot_id, '2026/11/25/')"), '20001');
    assert.ok(Number(await spills()) > before, 'expected external join writes');
  });
  it('makes concurrent CLI imports of the same date safe through a shared HTTP session', async () => {
    const originalInitialize = ClickHouseConnection.initialize;
    const previousDatabase = process.env.CLICKHOUSE_DB;
    process.env.CLICKHOUSE_DB = database;
    const log = sinon.stub(console, 'log');
    const error = sinon.stub(console, 'error');
    const initialize = sinon.stub(ClickHouseConnection, 'initialize').callsFake((config) => {
      const client = originalInitialize.call(ClickHouseConnection, config).getClient();
      return {
        getClient: () => ({
          command: (params) =>
            client.command({
              ...params,
              query_params: {
                ...params.query_params,
                source_url: params.query_params.source_url
                  .replace('https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/', sourceBase)
                  .replace('{00..23}/{00..59}', '00/{00..01}'),
              },
            }),
          close: () => client.close(),
        }),
      };
    });
    try {
      const results = await Promise.allSettled([ingest(['2026-11-24']), ingest(['2026-11-24'])]);
      assert.ok(results.some((result) => result.status === 'fulfilled'));
    } finally {
      initialize.restore();
      log.restore();
      error.restore();
      if (previousDatabase === undefined) delete process.env.CLICKHOUSE_DB;
      else process.env.CLICKHOUSE_DB = previousDatabase;
    }
    assert.equal(await sql("SELECT count() FROM siri_vehicle_location WHERE startsWith(siri_snapshot_id, '2026/11/24/')"), '2');
  });
});
