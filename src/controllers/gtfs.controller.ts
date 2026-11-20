import type { FastifyReply } from 'fastify';

import * as schemas from '../schemas/gtfs.schema.js';
import type { SchemaRequest } from '../types.js';
import {
  badRequest,
  columns,
  count,
  dateRange,
  db,
  get,
  integerList,
  list,
  literalPattern,
  timeRange,
  type FilterQuery,
  type Query,
} from './transit-query.js';

const routeFields = [
  'date',
  'line_ref',
  'operator_ref',
  'route_short_name',
  'route_long_name',
  'route_mkt',
  'route_direction',
  'route_alternative',
  'agency_name',
  'route_type',
] as const;
const stopFields = ['date', 'code', 'lat', 'lon', 'name', 'city'] as const;
const rideFields = ['gtfs_route_id', 'journey_ref', 'start_time', 'end_time'] as const;
const rideStopFields = [
  'gtfs_stop_id',
  'gtfs_ride_id',
  'arrival_time',
  'departure_time',
  'stop_sequence',
  'pickup_type',
  'drop_off_type',
  'shape_dist_traveled',
] as const;

function routeFilters<Q extends FilterQuery>(query: Q, input: Query<typeof schemas.listGtfsRoutesSchema>) {
  query = dateRange(query, 'gtfs_route.date', input.date_from, input.date_to);
  const lines = integerList(input.line_refs, 'line_refs');
  const operators = integerList(input.operator_refs, 'operator_refs');
  if (lines) query = query.where('gtfs_route.line_ref', 'in', lines);
  if (operators) query = query.where('gtfs_route.operator_ref', 'in', operators);
  if (input.route_long_name_contains !== undefined) {
    query = query.where('gtfs_route.route_long_name', 'like', `%${literalPattern(input.route_long_name_contains)}%`);
  }
  for (const field of ['route_short_name', 'route_mkt', 'route_direction', 'route_alternative', 'agency_name', 'route_type'] as const) {
    if (input[field] !== undefined) query = query.where(`gtfs_route.${field}`, 'eq', input[field]);
  }
  return query;
}

function rideFilters<Q extends FilterQuery>(query: Q, routeId?: number, prefix?: string, from?: string, to?: string) {
  if (routeId !== undefined) query = query.where('gtfs_ride.gtfs_route_id', 'eq', routeId);
  if (prefix !== undefined) query = query.where('gtfs_ride.journey_ref', 'like', `${literalPattern(prefix)}%`);
  return timeRange(query, 'gtfs_ride.start_time', from, to);
}

export async function listGtfsRoutes(request: SchemaRequest<typeof schemas.listGtfsRoutesSchema.schema>, reply: FastifyReply) {
  let query = db().table('gtfs_route');
  query = routeFilters(query, request.query);
  if (request.query.get_count) return count(query.count('gtfs_route.id', 'total'), reply);
  const fields = ['id', ...routeFields] as const;
  return list(query.select(fields), request.query, reply, 'gtfs_route', fields);
}

export async function getGtfsRoutes(request: SchemaRequest<typeof schemas.getGtfsRoutesSchema.schema>, reply: FastifyReply) {
  return get(
    db()
      .table('gtfs_route')
      .select(['id', ...routeFields])
      .where('id', 'eq', request.query.id)
      .limit(1),
    reply,
  );
}

export async function listGtfsStops(request: SchemaRequest<typeof schemas.listGtfsStopsSchema.schema>, reply: FastifyReply) {
  const { date_from, date_to, code, city, get_count, limit, offset } = request.query;
  let query = db().table('gtfs_stop');
  query = dateRange(query, 'gtfs_stop.date', date_from, date_to);
  if (code !== undefined) query = query.where('code', 'eq', code);
  if (city !== undefined) query = query.where('city', 'eq', city);
  if (get_count) return count(query.count('gtfs_stop.id', 'total'), reply);
  const fields = ['id', ...stopFields] as const;
  return list(query.select(fields), { limit, offset }, reply, 'gtfs_stop', fields);
}

export async function getGtfsStops(request: SchemaRequest<typeof schemas.getGtfsStopsSchema.schema>, reply: FastifyReply) {
  return get(
    db()
      .table('gtfs_stop')
      .select(['id', ...stopFields])
      .where('id', 'eq', request.query.id)
      .limit(1),
    reply,
  );
}

export async function listGtfsRides(request: SchemaRequest<typeof schemas.listGtfsRidesSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  let query = db().table('gtfs_ride').withRelation({ from: 'gtfs_ride', to: 'gtfs_route', leftColumn: 'gtfs_route_id', rightColumn: 'id' });
  query = rideFilters(query, input.gtfs_route_id, input.journey_ref_prefix, input.start_time_from, input.start_time_to);
  query = routeFilters(query, relatedRouteFilters(input));
  if (input.get_count) return count(query.count('gtfs_ride.id', 'total'), reply);
  const fields = ['id', ...rideFields] as const;
  return list(
    query.select([...columns('gtfs_ride', fields), ...columns('gtfs_route', routeFields, 'gtfs_route__')]),
    input,
    reply,
    'gtfs_ride',
    fields,
  );
}

export async function getGtfsRides(request: SchemaRequest<typeof schemas.getGtfsRidesSchema.schema>, reply: FastifyReply) {
  return get(
    db()
      .table('gtfs_ride')
      .select(['id', ...rideFields])
      .where('id', 'eq', request.query.id)
      .limit(1),
    reply,
  );
}

export async function listGtfsAgencies(request: SchemaRequest<typeof schemas.listGtfsAgenciesSchema.schema>, reply: FastifyReply) {
  const { date_from, date_to, limit, offset } = request.query;
  const fields = ['date', 'operator_ref', 'agency_name'] as const;
  let query = db().table('gtfs_route');
  query = dateRange(query, 'gtfs_route.date', date_from, date_to);
  return list(
    query.select(fields).groupBy([...fields]),
    { limit, offset },
    reply,
    'gtfs_route',
    [...fields],
    'date asc,agency_name asc,operator_ref asc',
  );
}

function relatedRouteFilters(input: Query<typeof schemas.listGtfsRidesSchema>) {
  return {
    date_from: input.gtfs_route__date_from,
    date_to: input.gtfs_route__date_to,
    line_refs: input.gtfs_route__line_refs,
    operator_refs: input.gtfs_route__operator_refs,
    route_short_name: input.gtfs_route__route_short_name,
    route_long_name_contains: input.gtfs_route__route_long_name_contains,
    route_mkt: input.gtfs_route__route_mkt,
    route_direction: input.gtfs_route__route_direction,
    route_alternative: input.gtfs_route__route_alternative,
    agency_name: input.gtfs_route__agency_name,
    route_type: input.gtfs_route__route_type,
  };
}

export async function listGtfsRideStops(request: SchemaRequest<typeof schemas.listGtfsRideStopsSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  const rideIds = integerList(input.gtfs_ride_ids, 'gtfs_ride_ids');
  const stopIds = integerList(input.gtfs_stop_ids, 'gtfs_stop_ids');
  if (rideIds?.length !== 1 && (!input.arrival_time_from || !input.arrival_time_to)) {
    throw badRequest('Supply a single gtfs_ride_id or both arrival time bounds');
  }
  let query = db()
    .table('gtfs_ride_stop')
    .withRelation({ from: 'gtfs_ride_stop', to: 'gtfs_ride', leftColumn: 'gtfs_ride_id', rightColumn: 'id' })
    .withRelation({ from: 'gtfs_ride_stop', to: 'gtfs_stop', leftColumn: 'gtfs_stop_id', rightColumn: 'id' })
    .withRelation({ from: 'gtfs_ride', to: 'gtfs_route', leftColumn: 'gtfs_route_id', rightColumn: 'id' });
  if (rideIds) query = query.where('gtfs_ride_stop.gtfs_ride_id', 'in', rideIds);
  if (stopIds) query = query.where('gtfs_ride_stop.gtfs_stop_id', 'in', stopIds);
  query = timeRange(query, 'gtfs_ride_stop.arrival_time', input.arrival_time_from, input.arrival_time_to);
  query = rideFilters(
    query,
    input.gtfs_ride__gtfs_route_id,
    input.gtfs_ride__journey_ref_prefix,
    input.gtfs_ride__start_time_from,
    input.gtfs_ride__start_time_to,
  );
  query = dateRange(query, 'gtfs_stop.date', input.gtfs_stop__date_from, input.gtfs_stop__date_to);
  if (input.gtfs_stop__code !== undefined) query = query.where('gtfs_stop.code', 'eq', input.gtfs_stop__code);
  if (input.gtfs_stop__city !== undefined) query = query.where('gtfs_stop.city', 'eq', input.gtfs_stop__city);
  query = routeFilters(query, relatedRouteFilters(input));
  if (input.get_count) return count(query.count('gtfs_ride_stop.id', 'total'), reply);
  const fields = ['id', ...rideStopFields] as const;
  return list(
    query.select([
      ...columns('gtfs_ride_stop', fields),
      ...columns('gtfs_ride', rideFields, 'gtfs_ride__'),
      ...columns('gtfs_stop', stopFields, 'gtfs_stop__'),
      ...columns('gtfs_route', routeFields, 'gtfs_route__'),
    ]),
    input,
    reply,
    'gtfs_ride_stop',
    fields,
  );
}

export async function getGtfsRideStops(request: SchemaRequest<typeof schemas.getGtfsRideStopsSchema.schema>, reply: FastifyReply) {
  return get(
    db()
      .table('gtfs_ride_stop')
      .select(['id', ...rideStopFields])
      .where('id', 'eq', String(request.query.id))
      .limit(1),
    reply,
  );
}
