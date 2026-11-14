import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { relations } from './relations.js';

export function createDb(pool: Pool) {
  return drizzle({ client: pool, relations });
}

export type Database = ReturnType<typeof createDb>;
