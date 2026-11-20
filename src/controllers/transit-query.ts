import { createQueryBuilder, rawAs } from '@hypequery/clickhouse';
import type { FastifyReply } from 'fastify';
import { Readable } from 'node:stream';

import type { IntrospectedSchema } from '../../analytics/schema.js';
import { createDatabaseClient } from '../db/index.js';
import type { SchemaRequest } from '../types.js';

export type Row = Record<string, string | number | null>;
export type Query<S extends { schema: object }> = SchemaRequest<S['schema']>['query'];

let client: ReturnType<typeof createDatabaseClient> | undefined;

export function transitClient() {
  return (client ??= createDatabaseClient());
}

function createTransitDatabase() {
  return createQueryBuilder<IntrospectedSchema>({ client: transitClient(), integerJsonEncoding: 'server-default' });
}

let database: ReturnType<typeof createTransitDatabase> | undefined;

export function db() {
  return (database ??= createTransitDatabase());
}

export function columns<T extends keyof IntrospectedSchema>(table: T, fields: readonly (keyof IntrospectedSchema[T] & string)[], prefix = '') {
  return fields.map((field) => rawAs<Row[string], string>(`${table}.${field}`, prefix + field));
}

export function badRequest(message: string) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export function integerList(value: string | undefined, field: string) {
  if (value === undefined) return undefined;
  const items = value.split(',').map((item) => item.trim());
  if (items.length > 1000 || items.some((item) => !/^-?\d+$/.test(item) || !Number.isSafeInteger(Number(item)))) {
    throw badRequest(`${field} must contain up to 1000 comma-separated integers`);
  }
  return items.map(Number);
}

export interface FilterQuery {
  where(column: string, operator: 'eq' | 'gte' | 'lte' | 'like' | 'in', value: string | number | Date | number[] | string[]): this;
}

export function dateRange<Q extends FilterQuery>(query: Q, column: string, from?: string, to?: string) {
  if (from !== undefined) query = query.where(column, 'gte', from);
  if (to !== undefined) query = query.where(column, 'lte', to);
  return query;
}

export function timeRange<Q extends FilterQuery>(query: Q, column: string, from?: string, to?: string) {
  if (from !== undefined) {
    const fractional = /\.(\d+)/.exec(from)?.[1];
    const lower = Math.floor(Date.parse(from) / 1000) + (fractional && /[1-9]/.test(fractional) ? 1 : 0);
    query = query.where(column, 'gte', new Date(lower * 1000));
  }
  if (to !== undefined) query = query.where(column, 'lte', new Date(Math.floor(Date.parse(to) / 1000) * 1000));
  return query;
}

export function literalPattern(value: string) {
  return value.replace(/[\\%_]/g, '\\$&');
}

interface ListQuery {
  orderBy(column: string, direction?: 'ASC' | 'DESC'): this;
  limit(count: number): this;
  offset(count: number): this;
  execute(): Promise<Row[]>;
  stream(): Promise<ReadableStream<Row[]>>;
}

export function serializeRow(row: Row) {
  return Object.fromEntries(
    Object.entries(row).flatMap(([field, value]) => {
      if (value === null) return [];
      if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value) &&
        /(?:_time|last_heartbeat|updated_first_last_vehicle_locations|updated_duration_minutes)$/.test(field)
      ) {
        return [[field, value.replace(' ', 'T') + 'Z']];
      }
      return [[field, value]];
    }),
  );
}

async function* jsonArray(rows: ReadableStream<Row[]>) {
  const reader = rows.getReader();
  try {
    yield '[';
    let separator = '';
    for (let batch = await reader.read(); !batch.done; batch = await reader.read()) {
      for (const row of batch.value) {
        yield separator + JSON.stringify(serializeRow(row));
        separator = ',';
      }
    }
    yield ']';
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

export async function list(
  query: ListQuery,
  input: { limit?: number; offset?: number; order_by?: string },
  reply: FastifyReply,
  table: string,
  fields: readonly string[],
  defaultOrder = 'id asc',
) {
  const { limit = 100, offset = 0, order_by = defaultOrder } = input;
  if (limit < -1 || limit > 500_000 || offset < 0) throw badRequest('Invalid limit or offset');
  for (const entry of order_by.split(',')) {
    const [field, direction = 'asc', extra] = entry.trim().toLowerCase().split(/\s+/);
    if (extra || !fields.includes(field) || (direction !== 'asc' && direction !== 'desc')) {
      throw badRequest('Invalid order_by field or direction');
    }
    query = query.orderBy(`${table}.${field}`, direction === 'asc' ? 'ASC' : 'DESC');
  }
  if (limit === 0) return [];
  query = query.limit(limit === -1 ? 500_000 : limit);
  if (offset) query = query.offset(offset);
  if (limit === -1) {
    return reply.type('application/json').send(Readable.from(jsonArray(await query.stream())));
  }
  return (await query.execute()).map(serializeRow);
}

export async function get(query: { execute(): Promise<Row[]> }, reply: FastifyReply) {
  const [row] = await query.execute();
  return row ? serializeRow(row) : reply.code(404).send({ detail: 'Not found' });
}

export async function count(query: { execute(): Promise<{ total: string }[]> }, reply: FastifyReply) {
  const [row] = await query.execute();
  return reply.send(Number(row.total));
}
