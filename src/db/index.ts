import { createClient } from '@clickhouse/client';

import { getConnectionConfig } from './config.js';
/** Query transport only; schema and data lifecycle are managed externally. */
export function createDatabaseClient() {
  return createClient({
    ...getConnectionConfig(),
    request_timeout: 35000,
    clickhouse_settings: {
      readonly: '2',
      max_execution_time: 30,
      max_memory_usage: '1610612736',
      max_bytes_before_external_group_by: '805306368',
      max_bytes_before_external_sort: '805306368',
      cancel_http_readonly_queries_on_client_close: 1,
      output_format_json_quote_64bit_integers: 0,
      join_use_nulls: 1,
    },
  });
}
