import type { ClickHouseClient } from '@clickhouse/client';
import type { FastifyInstance } from 'fastify';

import { getConnectionConfig } from '../db/config.js';
import { createDatabaseClient } from '../db/index.js';
import { cacheControl, listEnds, windowEnd } from './cache.js';
import { Params } from './ch.js';
import { rawEndpoints, wrap } from './raw.js';
import { createRegistry } from './registry.js';
import { normalize, shapeRow } from './responses.js';
import { BadInput, BadRequest, buildQuery, TzRequired, UnknownOrderField } from './sql.js';

export interface TransitOptions {
  client?: Pick<ClickHouseClient, 'query' | 'close'>;
  database?: string;
}

export async function transitRoutes(app: FastifyInstance, options: TransitOptions) {
  const database = options.database ?? getConnectionConfig().database;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(database)) throw new Error('CLICKHOUSE_DB must be a SQL identifier');
  const client = options.client ?? createDatabaseClient();
  app.addHook('onClose', async () => {
    await client.close();
  });
  const { endpoints, getEndpoints } = createRegistry(database);

  const definitions = [
    ...endpoints.map((def) => ({
      path: def.path,
      build: (params: URLSearchParams) => buildQuery(def, params),
      cache: (params: URLSearchParams) => cacheControl(def, windowEnd(listEnds(def), params)),
      shape: normalize,
      single: false,
    })),
    ...rawEndpoints.map((def) => ({
      path: def.path,
      build: (params: URLSearchParams) => {
        const bound = new Params();
        return { ...wrap(def, def.build(params, database, bound), params), params: bound.values };
      },
      cache: (params: URLSearchParams) => cacheControl(def, windowEnd(def.windowEnd ?? [], params, def.windowEndDaysLater)),
      shape: (row: Record<string, unknown>) => shapeRow(def, normalize(row)),
      single: false,
    })),
    ...getEndpoints.map((def) => ({
      path: def.path,
      build: (params: URLSearchParams) => {
        const id = params.get('id');
        if (id === null || !/^-?\d+$/.test(id)) throw new BadRequest('id is required');
        const own = def.alias ? `${def.alias}.` : '';
        const select = [
          ...def.fields.map((field) => `${own}\`${field}\` AS \`${field}\``),
          ...(def.related ?? []).flatMap((related) => related.fields.map((field) => `${related.alias}.\`${field}\` AS \`${field}\``)),
        ].join(', ');
        return {
          sql: `SELECT ${select} FROM ${def.table}${def.alias ? ` AS ${def.alias}` : ''} ${(def.joins ?? []).join(' ')} WHERE ${own}id = {id:Int64} LIMIT 1`,
          params: { id },
          isCount: false,
        };
      },
      cache: () => cacheControl(def, undefined),
      shape: normalize,
      single: true,
    })),
  ];

  for (const def of definitions) {
    app.get(def.path, { schema: { hide: true } }, async (request, reply) => {
      const controller = new AbortController();
      const abort = () => {
        if (!reply.raw.writableFinished) controller.abort();
      };
      reply.raw.on('close', abort);
      try {
        const params = new URL(request.raw.url ?? '/', 'http://localhost').searchParams;
        const built = def.build(params);
        const rows = await client.query({
          query: built.sql,
          query_params: built.params,
          format: built.isCount ? 'TabSeparated' : 'JSONEachRow',
          abort_signal: controller.signal,
        });
        if (built.isCount) {
          const count = (await rows.text()).trim();
          if (!/^\d+$/.test(count)) throw new Error('Invalid count response');
          return reply.header('Cache-Control', def.cache(params)).type('application/json').send(count);
        }
        const body = (await rows.json<Record<string, unknown>>()).map(def.shape);
        if (def.single && body.length === 0) return reply.code(404).send({ detail: 'Not Found' });
        return reply.header('Cache-Control', def.cache(params)).send(def.single ? body[0] : body);
      } catch (error) {
        if (controller.signal.aborted) return reply;
        if (error instanceof BadInput) return reply.code(400).send({ detail: error.message });
        if (error instanceof BadRequest) return reply.code(422).send({ detail: error.message });
        if (error instanceof TzRequired || error instanceof UnknownOrderField) return reply.code(500).send({ message: error.message });
        request.log.error({ err: error }, 'Transit query failed');
        return reply.code(500).send({ detail: 'query failed' });
      } finally {
        reply.raw.removeListener('close', abort);
      }
    });
  }
}
