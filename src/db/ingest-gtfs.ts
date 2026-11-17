import { ClickHouseConnection } from '@hypequery/clickhouse';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { getConnectionConfig } from './config.js';
import { dates } from './ingest-siri.js';

const rawSchemas = {
  agency: 'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url',
  calendar: 'service_id,sunday,monday,tuesday,wednesday,thursday,friday,saturday,start_date,end_date',
  routes: 'route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_color',
  stops: 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,location_type,parent_station,zone_id',
  trips: 'route_id,service_id,trip_id,trip_headsign,direction_id,shape_id,wheelchair_accessible',
  stop_times: 'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled',
};
const targets = {
  route: 'id,date,line_ref,operator_ref,route_short_name,route_long_name,route_mkt,route_direction,route_alternative,agency_name,route_type',
  stop: 'id,date,code,lat,lon,name,city',
  ride: 'id,gtfs_route_id,journey_ref,first_gtfs_ride_stop_id,last_gtfs_ride_stop_id,start_time,end_time',
  ride_stop: 'id,gtfs_stop_id,gtfs_ride_id,arrival_time,departure_time,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled',
};
const refreshes = ['siri_ride_gtfs_ride_refresh', 'siri_ride_stop_gtfs_stop_refresh', 'siri_vehicle_location_distance_from_gtfs_stop_refresh'];
const workTables = [
  ...Object.keys(rawSchemas).map((name) => `raw_${name}`),
  'active_trip',
  'route',
  'stop',
  'ride',
  'ride_stop',
  'ride_stop_parsed',
  'old_route',
  'old_ride',
  'old_stop',
  'siri_ride',
  'siri_stop',
];

interface State {
  archive_date: string;
  day: string;
  phase: 'prepared' | 'complete';
  refreshes: string[];
}

export function archiveDate(args: string[]): string {
  if (args.length !== 1) throw new Error('Use YYYY-MM-DD (one GTFS archive date)');
  return dates(args)[0];
}

export function sourceUrl(day: string): string {
  return `https://openbus-stride-public.s3.eu-west-1.amazonaws.com/gtfs_archive/${day.replaceAll('-', '/')}/israel-public-transportation.zip`;
}

// SQL assets use an explicit separator, not a semicolon parser: strings may
// themselves contain semicolons. Every block is one HTTP query.
export function statements(sql: string): string[] {
  return sql
    .split(/^-- next statement\s*$/m)
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function ingest(date: string): Promise<void> {
  archiveDate([date]);
  const config = getConnectionConfig();
  const client = ClickHouseConnection.initialize({
    ...config,
    request_timeout: 3600000,
    session_id: `openbus_gtfs_ingest_${config.database}`,
    clickhouse_settings: {
      wait_end_of_query: 1,
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: 10000,
      mutations_sync: '2',
      max_threads: 2,
      max_download_threads: 2,
      max_memory_usage: '1073741824',
      max_bytes_before_external_sort: '268435456',
      max_bytes_before_external_group_by: '268435456',
      join_algorithm: 'grace_hash',
      max_bytes_in_join: '0',
      max_bytes_before_external_join: '268435456',
      max_bytes_ratio_before_external_join: 0,
    },
  }).getClient();
  let step = 'initialize';
  let day: string | undefined;
  const params: Record<string, string | string[]> = { database: config.database, archive_date: date };
  async function command(query: string, extra: Record<string, string | string[]> = {}) {
    await client.command({ query, query_params: { ...params, ...extra } });
  }
  async function rows<T>(query: string): Promise<T[]> {
    const result = await client.query({ query, query_params: params, format: 'JSONEachRow' });
    return result.json<T>();
  }
  async function asset(name: string) {
    for (const [index, query] of statements(await readFile(new URL(`./sql/${name}.sql`, import.meta.url), 'utf8')).entries()) {
      step = `${name}:${index + 1}`;
      await command(query);
    }
  }
  async function cleanup() {
    for (const name of workTables) await command(`DROP TABLE IF EXISTS {database:Identifier}.gtfs_ingest_${name} SYNC`);
  }
  async function save(state: State) {
    await command(
      `INSERT INTO {database:Identifier}.gtfs_ingest_state
      SELECT {archive_date:Date}, {day:Date32}, {phase:String}, {refreshes:Array(String)}, now64(9)`,
      {
        archive_date: state.archive_date,
        day: state.day,
        phase: state.phase,
        refreshes: state.refreshes,
      },
    );
  }
  try {
    await command(`CREATE TABLE IF NOT EXISTS {database:Identifier}.gtfs_ingest_state
      (archive_date Date, day Date32, phase String, refreshes Array(String), updated_at DateTime64(9))
      ENGINE = MergeTree ORDER BY updated_at`);
    const [pending] = await rows<State>(
      'SELECT archive_date, day, phase, refreshes FROM {database:Identifier}.gtfs_ingest_state ORDER BY updated_at DESC LIMIT 1',
    );
    if (pending?.phase === 'prepared' && pending.archive_date !== date) {
      throw new Error(`Unfinished GTFS replacement: rerun archive ${pending.archive_date} before importing ${date}`);
    }
    let state = pending?.phase === 'prepared' ? pending : undefined;
    if (!state) {
      step = 'clean previous staging';
      await cleanup();
      await command('TRUNCATE TABLE {database:Identifier}.gtfs_ingest_state');
      for (const [name, columns] of Object.entries(rawSchemas)) {
        step = `load ${name}.txt`;
        const schema = columns
          .split(',')
          .map((column) => `${column} String`)
          .join(', ');
        await command(`CREATE TABLE {database:Identifier}.gtfs_ingest_raw_${name} (${schema}) ENGINE = MergeTree ORDER BY tuple()`);
        await command(
          `INSERT INTO {database:Identifier}.gtfs_ingest_raw_${name}
          SELECT * FROM s3({member:String}, NOSIGN, 'CSV', {schema:String})
          SETTINGS input_format_csv_skip_first_lines = 1, input_format_csv_detect_header = 0,
            input_format_allow_errors_num = 0, input_format_allow_errors_ratio = 0,
            input_format_csv_allow_variable_number_of_columns = 0`,
          {
            member: `${sourceUrl(date)} :: ${name}.txt`,
            schema,
          },
        );
        // A ZIP-member pattern with no match can return zero rows rather than
        // an HTTP error. Required files must contain data, not just a header.
        await command(`SELECT throwIf(count() = 0, 'Missing or empty GTFS ${name}.txt')
          FROM {database:Identifier}.gtfs_ingest_raw_${name}`);
      }
      step = 'select first active service day';
      // Each weekly calendar needs at most seven candidates, even for long feeds.
      const [first] = await rows<{ day: string | null }>(`SELECT minOrNull(service_day) AS day FROM (
        SELECT addDays(toDate32(start_day), offset) AS service_day,
          [monday,tuesday,wednesday,thursday,friday,saturday,sunday][toDayOfWeek(service_day)] AS enabled,
          end_day
        FROM (SELECT *, concat(substring(start_date,1,4),'-',substring(start_date,5,2),'-',substring(start_date,7,2)) AS start_day,
          concat(substring(end_date,1,4),'-',substring(end_date,5,2),'-',substring(end_date,7,2)) AS end_day
          FROM {database:Identifier}.gtfs_ingest_raw_calendar
          WHERE service_id IN (SELECT service_id FROM {database:Identifier}.gtfs_ingest_raw_trips))
        ARRAY JOIN range(7) AS offset
        WHERE enabled = '1' AND service_day <= toDate32(end_day))`);
      if (!first?.day) throw new Error('Feed has no active service day');
      day = first.day;
      params.day = day;
      await asset('ingest-gtfs-prepare');
      step = 'record refresh state';
      const views = await rows<{ view: string }>(`SELECT view FROM system.view_refreshes
        WHERE database = {database:String}
          AND view IN ['siri_ride_gtfs_ride_refresh','siri_ride_stop_gtfs_stop_refresh','siri_vehicle_location_distance_from_gtfs_stop_refresh']
          AND status != 'Disabled'`);
      state = { archive_date: date, day, phase: 'prepared', refreshes: views.map((view) => view.view) };
      await save(state);
    }
    day = state.day;
    params.day = day;
    // Repeat the entire commit after an uncertain response. Both the old IDs
    // and new IDs are persisted, so deletion/reinsertion is safe at every step.
    step = 'pause SIRI refreshes';
    const existing = await rows<{ view: string }>(`SELECT view FROM system.view_refreshes
      WHERE database = {database:String}`);
    for (const name of [...refreshes].reverse()) {
      if (existing.some((view) => view.view === name)) {
        await command('SYSTEM STOP VIEW {database:Identifier}.{view:Identifier}', { view: name });
      }
    }
    // STOP cancels running refreshes. Wait for cancellation before mutations.
    for (let attempt = 0; ; attempt++) {
      const active = await rows<{ view: string }>(`SELECT view FROM system.view_refreshes
        WHERE database = {database:String} AND status = 'Running'
          AND view IN ['siri_ride_gtfs_ride_refresh','siri_ride_stop_gtfs_stop_refresh','siri_vehicle_location_distance_from_gtfs_stop_refresh']`);
      if (!active.length) break;
      if (attempt >= 60) throw new Error('Timed out waiting for SIRI refreshes to stop');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await asset('ingest-gtfs-replace');
    for (const [name, columns] of Object.entries(targets)) {
      step = `insert gtfs_${name}`;
      await command(`INSERT INTO {database:Identifier}.gtfs_${name} (${columns})
        SELECT ${columns} FROM {database:Identifier}.gtfs_ingest_${name}`);
    }
    await asset('ingest-gtfs-siri');
    step = 'resume SIRI refreshes';
    for (const view of state.refreshes) await command('SYSTEM START VIEW {database:Identifier}.{view:Identifier}', { view });
    step = 'record completion';
    await save({ ...state, phase: 'complete' });
    const counts: Record<string, string> = {};
    for (const name of Object.keys(targets)) {
      const [result] = await rows<{ count: string }>(`SELECT toString(count()) AS count FROM {database:Identifier}.gtfs_ingest_${name}`);
      counts[name] = result.count;
    }
    step = 'cleanup';
    await cleanup();
    console.log(JSON.stringify({ archive_date: date, day, status: 'replaced', counts }));
  } catch (error) {
    console.error(JSON.stringify({ archive_date: date, day, status: 'failed', step, error: String(error) }));
    throw error;
  } finally {
    await client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { positionals } = parseArgs({ allowPositionals: true });
    await ingest(archiveDate(positionals));
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
