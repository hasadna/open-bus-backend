import { ClickHouseConnection } from '@hypequery/clickhouse';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { getConnectionConfig } from './config.js';

export function dates(args: string[]): string[] {
  if (args.length < 1 || args.length > 2) throw new Error('Use YYYY-MM-DD [YYYY-MM-DD]');
  const first = args[0];
  const last = args[1] ?? first;
  for (const value of [first, last]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
      throw new Error(`Invalid UTC date: ${value}`);
    }
  }
  if (first > last) throw new Error('Start date must precede end date');
  const result: string[] = [];
  for (let day = Date.parse(first); day <= Date.parse(last); day += 86400000) result.push(new Date(day).toISOString().slice(0, 10));
  return result;
}

export function sourceUrl(day: string): string {
  return `https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/${day.replaceAll('-', '/')}/{00..23}/{00..59}.br`;
}

export async function ingest(days: string[]): Promise<void> {
  const config = getConnectionConfig();
  const sql = await readFile(new URL('./sql/ingest-siri.sql', import.meta.url), 'utf8');
  const client = ClickHouseConnection.initialize({
    ...config,
    request_timeout: 3600000,
    // ClickHouse rejects concurrent queries in the same HTTP session. This
    // serializes this CLI's inserts for a database when using the same user.
    session_id: `openbus_siri_ingest_${config.database}`,
    clickhouse_settings: {
      wait_end_of_query: 1,
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: 10000,
    },
  }).getClient();
  try {
    let failures = 0;
    for (const day of days) {
      try {
        // Match the upstream macro: ClickHouse expands a whole day's URL pattern.
        // The SQL skips rows already present, including after a partial import.
        await client.command({
          query: sql,
          query_params: { database: config.database, source_url: sourceUrl(day) },
        });
        console.log(JSON.stringify({ day, status: 'inserted' }));
      } catch (error) {
        failures++;
        console.error(JSON.stringify({ day, status: 'failed', error: String(error) }));
      }
    }
    if (failures) throw new Error(`${failures} day(s) failed; see the errors above`);
  } finally {
    await client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { positionals } = parseArgs({ allowPositionals: true });
    await ingest(dates(positionals));
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
