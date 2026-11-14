import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Pool } from 'pg';

import { createDb, type Database } from '../db/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

interface DrizzleOptions {
  connectionString: string;
}

const drizzlePlugin: FastifyPluginAsync<DrizzleOptions> = async (fastify, options) => {
  const pool = new Pool({
    connectionString: options.connectionString,
  });

  const db = createDb(pool);

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
};

export default fp(drizzlePlugin, {
  name: 'drizzle',
});
