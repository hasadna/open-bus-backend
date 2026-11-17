import { ClickHouseConnection } from '@hypequery/clickhouse';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { crc32, deflateRawSync } from 'node:zlib';
import sinon from 'sinon';

import { archiveDate, ingest, sourceUrl, statements } from '../src/db/ingest-gtfs.ts';

describe('GTFS ingestion input', () => {
  it('requires one valid archive date and constructs its URL', () => {
    assert.equal(archiveDate(['2025-12-30']), '2025-12-30');
    assert.equal(
      sourceUrl('2025-12-30'),
      'https://openbus-stride-public.s3.eu-west-1.amazonaws.com/gtfs_archive/2025/12/30/israel-public-transportation.zip',
    );
    for (const args of [[], ['2025-02-29'], ['2025-1-01'], ['2025-12-30', '2025-12-31']]) assert.throws(() => archiveDate(args));
  });
  it('splits SQL blocks without splitting semicolons inside strings', () => {
    assert.deepEqual(statements("SELECT 'a;b'\n-- next statement\nSELECT 2\n"), ["SELECT 'a;b'", 'SELECT 2']);
  });
  it('logs initialization failures and closes the client', async () => {
    const command = sinon.stub().rejects(new Error('database unavailable'));
    const close = sinon.stub().resolves();
    const init = sinon.stub(ClickHouseConnection, 'initialize').returns({ getClient: () => ({ command, close }) });
    const error = sinon.stub(console, 'error');
    const previous = { ...process.env };
    Object.assign(process.env, { CLICKHOUSE_URL: 'http://test:8123', CLICKHOUSE_DB: 'default', CLICKHOUSE_USER: 'test', CLICKHOUSE_PASSWORD: '' });
    try {
      await assert.rejects(ingest('2025-12-30'), /database unavailable/);
      assert.equal(close.callCount, 1);
      assert.equal(JSON.parse(error.firstCall.args[0]).step, 'initialize');
    } finally {
      init.restore();
      error.restore();
      for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
      Object.assign(process.env, previous);
    }
  });
});

// A real deflated ZIP, including a central directory for ClickHouse range reads.
function zip(files) {
  const entries = [];
  const directory = [];
  let offset = 0;
  for (const [filename, contents] of Object.entries(files)) {
    const name = Buffer.from(filename);
    const data = Buffer.from(contents);
    const compressed = deflateRawSync(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc32(data), 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(20, 4);
    local.copy(central, 6, 4, 28);
    central.writeUInt32LE(offset, 42);
    entries.push(local, name, compressed);
    directory.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(directory.length / 2, 8);
  end.writeUInt16LE(directory.length / 2, 10);
  end.writeUInt32LE(Buffer.concat(directory).length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...entries, ...directory, end]);
}

function feed(day = '20251230') {
  const headers = {
    agency: 'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url',
    calendar: 'service_id,sunday,monday,tuesday,wednesday,thursday,friday,saturday,start_date,end_date',
    routes: 'route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_color',
    stops: 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,location_type,parent_station,zone_id',
    trips: 'route_id,service_id,trip_id,trip_headsign,direction_id,shape_id,wheelchair_accessible',
    stop_times: 'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled',
  };
  const rows = {
    agency: '1,"מפעיל, א",http://test,Asia/Jerusalem,he,123,',
    calendar: `early,1,1,1,1,1,1,1,${day},${day}\nlate,1,1,1,1,1,1,1,20270101,20270102`,
    routes: '10,1,,"קו, ראשי",123-1-#,3,\n20,1,20,later,invalid,3,',
    stops:
      '100,7,"תחנה, א",רחוב: א עיר: חיפה רציף: 1,32.1,34.9,0,,7\n101,7,duplicate,,32.2,34.9,0,,7\n102,8,last,עיר: חיפה רציף:,32.3,34.9,0,,8\n200,9,unused,,32.4,34.9,0,,9',
    trips: '10,early,trip-a,,0,shape,1\n20,late,trip-b,,0,shape,1',
    stop_times:
      'trip-a,25:10:00,25:11:00,102,3,0,1,100\ntrip-a,23:50:00,23:51:00,100,1,0,0,0\ntrip-a,24:10:00,24:11:00,101,2,0,0,\ntrip-b,10:00:00,10:01:00,200,1,0,0,0',
  };
  return Object.fromEntries(Object.entries(headers).map(([name, header]) => [`${name}.txt`, `\uFEFF${header}\r\n${rows[name]}\r\n`]));
}

const integration = process.env.RUN_CLICKHOUSE_TESTS === '1' ? describe : describe.skip;
integration('GTFS ZIP ingestion on ClickHouse', function () {
  this.timeout(120000);
  let server;
  let database;
  let files;
  let initialize;
  let log;
  let error;
  let previousDatabase;
  let fail;
  let failAfter;
  let members;
  async function sql(query) {
    const url = new URL(process.env.CLICKHOUSE_URL);
    url.searchParams.set('database', database ?? 'default');
    const response = await fetch(url, {
      method: 'POST',
      body: query,
      headers: { 'X-ClickHouse-User': process.env.CLICKHOUSE_USER, 'X-ClickHouse-Key': process.env.CLICKHOUSE_PASSWORD },
      signal: AbortSignal.timeout(60000),
    });
    const body = await response.text();
    if (!response.ok || /Code: \d+\. DB::Exception/.test(body)) throw new Error(body);
    return body.trim();
  }
  before(async () => {
    server = createServer((request, response) => {
      const body = zip(files);
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      const start = range ? Number(range[1]) : 0;
      const end = range?.[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Content-Type', 'application/zip');
      response.setHeader('Content-Length', end - start + 1);
      if (range) {
        response.statusCode = 206;
        response.setHeader('Content-Range', `bytes ${start}-${end}/${body.length}`);
      }
      response.end(request.method === 'HEAD' ? undefined : body.subarray(start, end + 1));
    });
    server.listen(0, '0.0.0.0');
    await once(server, 'listening');
  });
  beforeEach(async () => {
    const target = `test_gtfs_${Date.now()}`;
    database = undefined;
    await sql(`CREATE DATABASE ${target}`);
    database = target;
    const migration = await readFile(new URL('../chkit/migrations/20261115215925_init.sql', import.meta.url), 'utf8');
    for (const table of migration.match(/CREATE TABLE IF NOT EXISTS default\.\w+\r?\n[\s\S]*?;\r?\n/g)) {
      await sql(table.replaceAll('default.', `${database}.`));
    }
    files = feed();
    fail = undefined;
    failAfter = undefined;
    members = [];
    previousDatabase = process.env.CLICKHOUSE_DB;
    process.env.CLICKHOUSE_DB = database;
    const original = ClickHouseConnection.initialize;
    initialize = sinon.stub(ClickHouseConnection, 'initialize').callsFake((config) => {
      const client = original
        .call(ClickHouseConnection, {
          ...config,
          request_timeout: 30000,
          clickhouse_settings: {
            ...config.clickhouse_settings,
            s3_connect_timeout_ms: 1000,
            s3_request_timeout_ms: 5000,
            s3_max_single_read_retries: 1,
          },
        })
        .getClient();
      return {
        getClient: () => ({
          command: async (args) => {
            if (fail?.(args.query)) throw new Error('injected failure');
            if (args.query_params.member) {
              members.push(args.query_params.member.split(' :: ')[1]);
              args.query_params.member = args.query_params.member.replace(
                sourceUrl('2025-12-30'),
                `http://${process.env.CLICKHOUSE_TEST_HTTP_HOST ?? 'host.docker.internal'}:${server.address().port}/bucket/feed.zip`,
              );
            }
            const result = await client.command(args);
            if (failAfter?.(args.query)) throw new Error('uncertain response');
            return result;
          },
          query: (args) => client.query(args),
          close: () => client.close(),
        }),
      };
    });
    log = sinon.stub(console, 'log');
    error = sinon.stub(console, 'error');
  });
  afterEach(async () => {
    initialize?.restore();
    log?.restore();
    error?.restore();
    if (previousDatabase === undefined) delete process.env.CLICKHOUSE_DB;
    else process.env.CLICKHOUSE_DB = previousDatabase;
    const target = database;
    database = undefined;
    if (target) await sql(`DROP DATABASE ${target} SYNC`);
  });
  after(async () => {
    server?.closeAllConnections();
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
  });
  it('reads six BOM-bearing CSV members, prunes to the first day, and maps endpoints and extended hours', async () => {
    await ingest('2025-12-30');
    assert.equal(members.length, 6);
    assert.equal(await sql('SELECT count() FROM gtfs_route'), '1');
    assert.equal(await sql('SELECT count() FROM gtfs_stop'), '3');
    assert.equal(await sql('SELECT count() FROM gtfs_ride'), '1');
    assert.equal(await sql('SELECT count() FROM gtfs_ride_stop'), '3');
    assert.equal(
      await sql('SELECT date,route_short_name,route_long_name,agency_name,route_mkt,route_direction,route_alternative FROM gtfs_route'),
      '2025-12-30\tNaN\tקו, ראשי\tמפעיל, א\t123\t1\t#',
    );
    assert.equal(await sql('SELECT count() FROM gtfs_stop WHERE code = 7'), '2');
    assert.equal(await sql("SELECT city FROM gtfs_stop WHERE name = 'last'"), 'חיפה');
    assert.equal(await sql('SELECT count() FROM gtfs_ride_stop WHERE shape_dist_traveled IS NULL'), '2');
    assert.equal(
      await sql('SELECT toString(start_time),toString(end_time) FROM gtfs_ride'),
      '2025-12-30 21:51:00.000000\t2025-12-30 23:10:00.000000',
    );
    assert.equal(
      await sql('SELECT count() FROM gtfs_ride AS r INNER JOIN gtfs_ride_stop AS s ON s.id = r.first_gtfs_ride_stop_id WHERE s.stop_sequence = 1'),
      '1',
    );
    assert.equal(
      await sql(
        "SELECT count() FROM system.tables WHERE database = currentDatabase() AND startsWith(name,'gtfs_ingest_') AND name != 'gtfs_ingest_state'",
      ),
      '0',
    );
  });
  it('replaces a day repeatedly while preserving other days and valid foreign keys', async () => {
    await sql("INSERT INTO gtfs_route (id,date,line_ref) VALUES (100,'2025-12-29',99)");
    await sql("INSERT INTO gtfs_stop (id,date,code) VALUES (100,'2025-12-29',99)");
    await sql("INSERT INTO gtfs_ride (id,gtfs_route_id,journey_ref) VALUES (100,100,'old')");
    await sql('INSERT INTO gtfs_ride_stop (id,gtfs_ride_id,gtfs_stop_id) VALUES (100,100,100)');
    await ingest('2025-12-30');
    await ingest('2025-12-30');
    assert.equal(await sql('SELECT count(),uniqExact(id) FROM gtfs_route'), '2\t2');
    assert.equal(await sql('SELECT count(),uniqExact(id) FROM gtfs_ride_stop'), '4\t4');
    assert.equal(
      await sql(
        'SELECT count() FROM gtfs_ride_stop AS s INNER JOIN gtfs_ride AS r ON r.id = s.gtfs_ride_id INNER JOIN gtfs_stop AS p ON p.id = s.gtfs_stop_id',
      ),
      '4',
    );
    assert.equal(await sql('SELECT journey_ref FROM gtfs_ride WHERE id=100'), 'old');
  });
  it('resumes after deletion and an uncertain partially committed insert using durable IDs without downloading again', async () => {
    await ingest('2025-12-30');
    let injected = false;
    fail = (query) => {
      if (!injected && query.startsWith('INSERT INTO {database:Identifier}.gtfs_ride (')) {
        injected = true;
        return true;
      }
      return false;
    };
    await assert.rejects(ingest('2025-12-30'), /injected failure/);
    const ids = await sql('SELECT id FROM gtfs_ingest_route');
    await assert.rejects(ingest('2025-12-31'), /Unfinished GTFS replacement/);
    const downloads = members.length;
    fail = undefined;
    await ingest('2025-12-30');
    assert.equal(members.length, downloads);
    assert.equal(await sql('SELECT id FROM gtfs_route'), ids);
    assert.equal(await sql('SELECT count(),uniqExact(id) FROM gtfs_ride_stop'), '3\t3');
  });
  it('rejects missing members and dangling stops before changing the destination', async () => {
    await ingest('2025-12-30');
    const id = await sql('SELECT id FROM gtfs_route');
    delete files['agency.txt'];
    await assert.rejects(ingest('2025-12-30'));
    files = feed();
    files['stop_times.txt'] = files['stop_times.txt'].replace(',102,3,', ',999,3,');
    await assert.rejects(ingest('2025-12-30'), /Invalid GTFS/);
    assert.equal(await sql('SELECT id FROM gtfs_route'), id);
    assert.equal(await sql('SELECT count() FROM gtfs_ride_stop'), '3');
  });
  it('finds the first enabled weekday rather than the earliest calendar start', async () => {
    files['calendar.txt'] = files['calendar.txt'].replace('early,1,1,1,1,1,1,1,20251230,20251230', 'early,0,0,0,1,0,0,0,20251230,20260105');
    await ingest('2025-12-30');
    assert.equal(await sql('SELECT date FROM gtfs_route'), '2025-12-31');
  });
  it('rejects a calendar with no active day and malformed CSV without modifying existing data', async () => {
    await ingest('2025-12-30');
    const id = await sql('SELECT id FROM gtfs_route');
    files['calendar.txt'] = files['calendar.txt'].replaceAll(',1,1,1,1,1,1,1,', ',0,0,0,0,0,0,0,');
    await assert.rejects(ingest('2025-12-30'), /no active service day/);
    files = feed();
    files['routes.txt'] += 'broken,row\n';
    await assert.rejects(ingest('2025-12-30'));
    assert.equal(await sql('SELECT id FROM gtfs_route'), id);
  });
  for (const [date, endTime] of [
    ['20250327', '2025-03-28 00:10:00.000000'],
    ['20251025', '2025-10-26 01:10:00.000000'],
  ]) {
    it(`converts extended hours across Israel's timezone transition on ${date}`, async () => {
      files = feed(date);
      files['stop_times.txt'] = files['stop_times.txt'].replace('25:10:00,25:11:00', '27:10:00,27:11:00');
      await ingest('2025-12-30');
      assert.equal(await sql('SELECT toString(end_time) FROM gtfs_ride'), endTime);
    });
  }
  it('recovers a committed insert whose response was lost without duplicate rows', async () => {
    failAfter = (query) => query.startsWith('INSERT INTO {database:Identifier}.gtfs_ride_stop (');
    await assert.rejects(ingest('2025-12-30'), /uncertain response/);
    assert.equal(await sql('SELECT count() FROM gtfs_ride_stop'), '3');
    failAfter = undefined;
    await ingest('2025-12-30');
    assert.equal(await sql('SELECT count(),uniqExact(id) FROM gtfs_ride_stop'), '3\t3');
  });
  it('replaces a partially written stop-times table on recovery', async () => {
    fail = (query) => query.startsWith('INSERT INTO {database:Identifier}.gtfs_ride_stop (');
    await assert.rejects(ingest('2025-12-30'), /injected failure/);
    await sql(`INSERT INTO gtfs_ride_stop
      (id,gtfs_stop_id,gtfs_ride_id,arrival_time,departure_time,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled)
      SELECT id,gtfs_stop_id,gtfs_ride_id,arrival_time,departure_time,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled
      FROM gtfs_ingest_ride_stop LIMIT 1`);
    fail = undefined;
    await ingest('2025-12-30');
    assert.equal(await sql('SELECT count(),uniqExact(id) FROM gtfs_ride_stop'), '3\t3');
  });
  it('rejects exhausted Int32 IDs before modifying destination rows', async () => {
    await sql("INSERT INTO gtfs_route (id,date,line_ref) VALUES (2147483647,'2025-12-29',99)");
    await assert.rejects(ingest('2025-12-30'), /exhausted ID capacity/);
    assert.equal(await sql('SELECT count(),max(id) FROM gtfs_route'), '1\t2147483647');
  });
  it('keeps refreshes stopped after failure and restores only previously enabled refreshes on recovery', async () => {
    const names = ['siri_ride_gtfs_ride', 'siri_ride_stop_gtfs_stop', 'siri_vehicle_location_distance_from_gtfs_stop'];
    for (const name of names) {
      await sql(`CREATE MATERIALIZED VIEW ${name}_refresh REFRESH EVERY 1 HOUR APPEND TO ${name} EMPTY AS SELECT * FROM ${name} WHERE 0`);
    }
    await sql('SYSTEM STOP VIEW siri_ride_stop_gtfs_stop_refresh');
    fail = (query) => query.startsWith('INSERT INTO {database:Identifier}.gtfs_ride (');
    await assert.rejects(ingest('2025-12-30'), /injected failure/);
    assert.equal(await sql("SELECT count() FROM system.view_refreshes WHERE database=currentDatabase() AND status='Disabled'"), '3');
    fail = undefined;
    await ingest('2025-12-30');
    assert.equal(
      await sql("SELECT status FROM system.view_refreshes WHERE database=currentDatabase() AND view='siri_ride_stop_gtfs_stop_refresh'"),
      'Disabled',
    );
    assert.equal(await sql("SELECT count() FROM system.view_refreshes WHERE database=currentDatabase() AND status='Scheduled'"), '2');
  });
  it('rebuilds historical SIRI matches and distances after IDs change', async () => {
    await sql(`INSERT INTO siri_vehicle_location
      (siri_snapshot_id,recorded_at_time,line_ref,data_frame_ref,dated_vehicle_journey_ref,operator_ref,origin_aimed_departure_time,
       vehicle_location_longitude,vehicle_location_latitude,stop_point_ref,stop_order)
      VALUES ('2025/12/30/21/51','2025-12-30 21:51:00','10','2025-12-30','trip-a','1','2025-12-30 21:51:00','34.9','32.3','8','3')`);
    await ingest('2025-12-30');
    const old = await sql('SELECT gtfs_ride_id FROM siri_ride_gtfs_ride');
    await ingest('2025-12-30');
    assert.notEqual(await sql('SELECT gtfs_ride_id FROM siri_ride_gtfs_ride'), old);
    assert.equal(await sql('SELECT count() FROM siri_ride_gtfs_ride AS m INNER JOIN gtfs_ride AS r ON r.id=m.gtfs_ride_id'), '1');
    assert.equal(await sql('SELECT count() FROM siri_ride_stop_gtfs_stop AS m INNER JOIN gtfs_stop AS s ON s.id=m.gtfs_stop_id'), '1');
    assert.equal(await sql('SELECT distance_from_gtfs_stop_meters FROM siri_vehicle_location_distance_from_gtfs_stop'), '0');
  });
  it('includes SIRI rides starting after midnight in the selected service day', async () => {
    files['stop_times.txt'] = files['stop_times.txt']
      .replace('23:50:00,23:51:00', '26:50:00,26:51:00')
      .replace('24:10:00,24:11:00', '27:00:00,27:01:00')
      .replace('25:10:00,25:11:00', '27:10:00,27:11:00');
    await sql(`INSERT INTO siri_vehicle_location
      (siri_snapshot_id,recorded_at_time,line_ref,data_frame_ref,dated_vehicle_journey_ref,operator_ref,origin_aimed_departure_time)
      VALUES ('2025/12/31/00/51','2025-12-31 00:51:00','10','2025-12-30','trip-a','1','2025-12-31 00:51:00')`);
    await ingest('2025-12-30');
    assert.equal(await sql('SELECT count() FROM siri_ride_gtfs_ride AS m INNER JOIN gtfs_ride AS r ON r.id=m.gtfs_ride_id'), '1');
  });
});
