import { createQueryBuilder } from '@hypequery/clickhouse';

import { getConnectionConfig } from './config.js';
import type * as definitions from './schema/index.js';

export { getConnectionConfig } from './config.js';

type Table = Extract<(typeof definitions)[keyof typeof definitions], { kind: 'table' }>;

/** Query types follow the code-first table definitions without importing them at runtime. */
export type QuerySchema = {
  [Definition in Table as Definition['name']]: {
    [Column in Definition['columns'][number] as Column['name']]: Column['type'];
  };
};

export const db = createQueryBuilder<QuerySchema>(getConnectionConfig());
