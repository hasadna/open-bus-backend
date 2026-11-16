import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { brotliDecompressSync } from 'node:zlib';

import { getConnectionConfig } from './config.js';

export function dates(options: { date?: string; from?: string; to?: string }): string[] {
  if (options.date ? options.from || options.to : !options.from || !options.to) {
    throw new Error('Use --date YYYY-MM-DD or --from YYYY-MM-DD --to YYYY-MM-DD');
  }
  const first = options.date ?? options.from!;
  const last = options.date ?? options.to!;
  for (const value of [first, last]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
      throw new Error(`Invalid UTC date: ${value}`);
    }
  }
  if (first > last) throw new Error('--from must precede --to');
  const result: string[] = [];
  for (let day = Date.parse(first); day <= Date.parse(last); day += 86400000) result.push(new Date(day).toISOString().slice(0, 10));
  return result;
}

export function snapshotKey(day: string, minute: number): string {
  return `${day.replaceAll('-', '/')}/${String(Math.floor(minute / 60)).padStart(2, '0')}/${String(minute % 60).padStart(2, '0')}.br`;
}

export function validateDocument(payload: string): void {
  const document = JSON.parse(payload);
  const service = document?.Siri?.ServiceDelivery;
  if (!service || !Array.isArray(service.StopMonitoringDelivery)) throw new Error('Invalid SIRI delivery');
  for (const delivery of [service, ...service.StopMonitoringDelivery]) {
    if (delivery.Status === false || delivery.Status === 'false' || delivery.ErrorCondition) throw new Error('SIRI reports unsuccessful delivery');
  }
  for (const delivery of service.StopMonitoringDelivery) {
    if (delivery.MonitoredStopVisit !== undefined && !Array.isArray(delivery.MonitoredStopVisit)) throw new Error('Invalid visits');
    for (const visit of delivery.MonitoredStopVisit ?? []) {
      const journey = visit.MonitoredVehicleJourney;
      for (const value of [visit.RecordedAtTime, journey?.OriginAimedDepartureTime]) {
        if (typeof value !== 'string' || !/(Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value)))
          throw new Error('Invalid observation timestamp');
      }
      if (!journey?.FramedVehicleJourneyRef || !journey.MonitoredCall) throw new Error('Incomplete vehicle journey');
    }
  }
}

export async function ingest(days: string[]): Promise<void> {
  const config = getConnectionConfig();
  const sql = await readFile(new URL('./sql/ingest-siri.sql', import.meta.url), 'utf8');
  async function query(statement: string, params: Record<string, string> = {}, data = ''): Promise<string> {
    const url = new URL(config.url);
    url.searchParams.set('database', config.database);
    const parameters: Record<string, string> = { database: config.database, ...params };
    // CREATE ... AS does not accept identifier parameters in all ClickHouse versions.
    // Quote identifiers locally; values remain server-side query parameters.
    const queryText = statement.replace(/\{(\w+):Identifier\}/g, (_, name: string) => {
      const value = parameters[name];
      if (value === undefined) throw new Error(`Missing identifier: ${name}`);
      return '`' + value.replaceAll('\\', '\\\\').replaceAll('`', '\\`') + '`';
    });
    url.searchParams.set('query', queryText);
    url.searchParams.set('wait_end_of_query', '1');
    for (const [key, value] of Object.entries({ database: config.database, ...params })) url.searchParams.set(`param_${key}`, value);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'X-ClickHouse-User': config.username, 'X-ClickHouse-Key': config.password },
      body: data,
      signal: AbortSignal.timeout(300000),
    });
    const body = await response.text();
    if (!response.ok || /Code: \d+\. DB::Exception/.test(body)) throw new Error(`ClickHouse query failed: ${body}`);
    return body;
  }
  // Refuse monthly tables before downloading or writing anything.
  const partition = (
    await query(
      "SELECT partition_key FROM system.tables WHERE database = {database:String} AND name = 'siri_vehicle_location' FORMAT TabSeparatedRaw",
    )
  ).trim();
  const expectedPartition =
    "format('{0}/{1}/{2}', splitByChar('/', siri_snapshot_id)[1], splitByChar('/', siri_snapshot_id)[2], splitByChar('/', siri_snapshot_id)[3])";
  if (partition.replaceAll(' ', '') !== expectedPartition.replaceAll(' ', ''))
    throw new Error('siri_vehicle_location requires the daily snapshot partition migration; see src/db/README.md');
  let failures = 0;
  for (const day of days) {
    const table = `siri_ingest_${randomUUID().replaceAll('-', '')}`;
    const params = { table };
    await query('CREATE TABLE {database:Identifier}.{table:Identifier} AS {database:Identifier}.siri_vehicle_location', params);
    let downloaded = 0;
    let missing = 0;
    try {
      // Bound memory to one decompressed snapshot and avoid creating thousands of parts at once.
      for (let minute = 0; minute < 1440; minute++) {
        const snapshot = snapshotKey(day, minute);
        let response: Response | undefined;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            response = await fetch(`https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/${snapshot}`, {
              signal: AbortSignal.timeout(60000),
            });
            if (response.status !== 429 && response.status < 500) break;
            await response.body?.cancel();
            response = undefined;
          } catch (error) {
            if (attempt === 2) throw error;
          }
        }
        if (!response) throw new Error(`Download retries exhausted: ${snapshot}`);
        if (response.status === 404) {
          await response.body?.cancel();
          missing++;
          console.warn(`Missing: ${snapshot}`);
          continue;
        }
        if (!response.ok) throw new Error(`Download ${snapshot}: HTTP ${response.status}`);
        const payload = brotliDecompressSync(Buffer.from(await response.arrayBuffer()), { maxOutputLength: 128 * 1024 * 1024 }).toString('utf8');
        validateDocument(payload);
        // Never retry an INSERT after an uncertain response. This staging table is disposable.
        await query(sql, { ...params, snapshot }, JSON.stringify(JSON.parse(payload)));
        downloaded++;
      }
      const rows = Number((await query('SELECT count() FROM {database:Identifier}.{table:Identifier}', params)).trim());
      if (!rows) throw new Error('No observations downloaded; preserving existing day');
      await query(
        'ALTER TABLE {database:Identifier}.siri_vehicle_location REPLACE PARTITION {partition:String} FROM {database:Identifier}.{table:Identifier}',
        { ...params, partition: day.replaceAll('-', '/') },
      );
      console.log(JSON.stringify({ day, downloaded, missing, rows, status: 'refreshed' }));
    } catch (error) {
      failures++;
      console.error(JSON.stringify({ day, downloaded, missing, status: 'failed', error: String(error) }));
    } finally {
      await query('DROP TABLE IF EXISTS {database:Identifier}.{table:Identifier}', params);
    }
  }
  if (failures) throw new Error(`${failures} day(s) failed; rerun those dates to recover`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { values } = parseArgs({ options: { date: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } } });
    await ingest(dates(values));
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
