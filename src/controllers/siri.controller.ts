import type { FastifyReply } from 'fastify';

import type * as schemas from '../schemas/siri.schema.js';
import type { SchemaRequest } from '../types.js';
import { columns, count, dateRange, db, get, integerList, list, literalPattern, timeRange, type FilterQuery } from './transit-query.js';

const routes = ['id', 'line_ref', 'operator_ref'] as const;
const stops = ['id', 'code'] as const;
const rides = [
  'id',
  'siri_route_id',
  'journey_ref',
  'scheduled_start_time',
  'vehicle_ref',
  'updated_first_last_vehicle_locations',
  'first_vehicle_location_id',
  'last_vehicle_location_id',
  'updated_duration_minutes',
  'duration_minutes',
  'journey_gtfs_ride_id',
  'route_gtfs_ride_id',
  'gtfs_ride_id',
] as const;
const rideStops = ['id', 'siri_stop_id', 'siri_ride_id', 'order', 'gtfs_stop_id', 'nearest_siri_vehicle_location_id'] as const;
const locations = [
  'id',
  'siri_snapshot_id',
  'siri_ride_stop_id',
  'recorded_at_time',
  'lon',
  'lat',
  'bearing',
  'velocity',
  'distance_from_journey_start',
  'distance_from_siri_ride_stop_meters',
] as const;
const snapshots = [
  'id',
  'snapshot_id',
  'etl_status',
  'etl_start_time',
  'etl_end_time',
  'error',
  'num_successful_parse_vehicle_locations',
  'num_failed_parse_vehicle_locations',
  'num_added_siri_rides',
  'num_added_siri_ride_stops',
  'num_added_siri_routes',
  'num_added_siri_stops',
  'last_heartbeat',
  'created_by',
] as const;
const gtfsRide = ['gtfs_route_id', 'journey_ref', 'start_time', 'end_time'] as const;
const gtfsRoute = [
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

function where<Q extends FilterQuery>(query: Q, column: string, value?: string | number) {
  return value === undefined ? query : query.where(column, 'eq', value);
}

function integers<Q extends FilterQuery>(query: Q, column: string, field: string, value?: string) {
  const values = integerList(value, field);
  return values === undefined ? query : query.where(column, 'in', values);
}

function strings<Q extends FilterQuery>(query: Q, column: string, value?: string) {
  return value === undefined
    ? query
    : query.where(
        column,
        'in',
        value.split(',').map((item) => item.trim()),
      );
}

function prefix<Q extends FilterQuery>(query: Q, column: string, value?: string) {
  return value === undefined ? query : query.where(column, 'like', literalPattern(value) + '%');
}

function bounds<Q extends FilterQuery>(query: Q, column: string, lower?: number, upper?: number) {
  if (lower !== undefined) query = query.where(column, 'gte', lower);
  if (upper !== undefined) query = query.where(column, 'lte', upper);
  return query;
}

export async function listSiriRoutes(request: SchemaRequest<typeof schemas.listSiriRoutesSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  let query = db().table('siri_route');
  query = integers(query, 'line_ref', 'line_refs', input.line_refs);
  query = integers(query, 'operator_ref', 'operator_refs', input.operator_refs);
  if (input.get_count) return count(query.count('id', 'total'), reply);
  return list(query.select(routes), input, reply, 'siri_route', routes);
}

export async function getSiriRoutes(request: SchemaRequest<typeof schemas.getSiriRoutesSchema.schema>, reply: FastifyReply) {
  return get(db().table('siri_route').select(routes).where('id', 'eq', request.query.id).limit(1), reply);
}

export async function listSiriRides(request: SchemaRequest<typeof schemas.listSiriRidesSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  let query = db()
    .table('siri_ride')
    .withRelation({ from: 'siri_ride', to: 'siri_route', leftColumn: 'siri_route_id', rightColumn: 'id', type: 'INNER' })
    .withRelation({ from: 'siri_ride', to: 'gtfs_ride', leftColumn: 'gtfs_ride_id', rightColumn: 'id', type: 'LEFT' })
    .withRelation({ from: 'gtfs_ride', to: 'gtfs_route', leftColumn: 'gtfs_route_id', rightColumn: 'id', type: 'LEFT' });
  query = integers(query, 'siri_ride.siri_route_id', 'siri_route_ids', input.siri_route_ids);
  query = integers(query, 'siri_route.line_ref', 'siri_route__line_refs', input.siri_route__line_refs);
  query = integers(query, 'siri_route.operator_ref', 'siri_route__operator_refs', input.siri_route__operator_refs);
  query = prefix(query, 'siri_ride.journey_ref', input.journey_ref_prefix);
  query = strings(query, 'siri_ride.journey_ref', input.journey_refs);
  query = strings(query, 'siri_ride.vehicle_ref', input.vehicle_refs);
  query = timeRange(query, 'siri_ride.scheduled_start_time', input.scheduled_start_time_from, input.scheduled_start_time_to);
  query = where(query, 'gtfs_ride.gtfs_route_id', input.gtfs_ride__gtfs_route_id);
  query = prefix(query, 'gtfs_ride.journey_ref', input.gtfs_ride__journey_ref_prefix);
  query = timeRange(query, 'gtfs_ride.start_time', input.gtfs_ride__start_time_from, input.gtfs_ride__start_time_to);
  query = dateRange(query, 'gtfs_route.date', input.gtfs_route__date_from, input.gtfs_route__date_to);
  query = integers(query, 'gtfs_route.line_ref', 'gtfs_route__line_refs', input.gtfs_route__line_refs);
  query = integers(query, 'gtfs_route.operator_ref', 'gtfs_route__operator_refs', input.gtfs_route__operator_refs);
  for (const field of ['route_short_name', 'route_mkt', 'route_direction', 'route_alternative', 'agency_name', 'route_type'] as const) {
    query = where(query, `gtfs_route.${field}`, input[`gtfs_route__${field}`]);
  }
  if (input.gtfs_route__route_long_name_contains !== undefined) {
    query = query.where('gtfs_route.route_long_name', 'like', '%' + literalPattern(input.gtfs_route__route_long_name_contains) + '%');
  }
  if (input.get_count) return count(query.count('siri_ride.id', 'total'), reply);
  return list(
    query.select([
      ...columns('siri_ride', rides),
      ...columns('siri_route', ['line_ref', 'operator_ref'], 'siri_route__'),
      ...columns('gtfs_ride', gtfsRide, 'gtfs_ride__'),
      ...columns('gtfs_route', gtfsRoute, 'gtfs_route__'),
    ]),
    input,
    reply,
    'siri_ride',
    rides,
  );
}

export async function getSiriRides(request: SchemaRequest<typeof schemas.getSiriRidesSchema.schema>, reply: FastifyReply) {
  return get(db().table('siri_ride').select(rides).where('id', 'eq', request.query.id).limit(1), reply);
}

export async function listSiriStops(request: SchemaRequest<typeof schemas.listSiriStopsSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  const query = integers(db().table('siri_stop'), 'code', 'codes', input.codes);
  if (input.get_count) return count(query.count('id', 'total'), reply);
  return list(query.select(stops), input, reply, 'siri_stop', stops);
}

export async function getSiriStops(request: SchemaRequest<typeof schemas.getSiriStopsSchema.schema>, reply: FastifyReply) {
  return get(db().table('siri_stop').select(stops).where('id', 'eq', request.query.id).limit(1), reply);
}

export async function listSiriRideStops(request: SchemaRequest<typeof schemas.listSiriRideStopsSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  let query = db()
    .table('siri_ride_stop')
    .withRelation({ from: 'siri_ride_stop', to: 'siri_stop', leftColumn: 'siri_stop_id', rightColumn: 'id', type: 'INNER' })
    .withRelation({ from: 'siri_ride_stop', to: 'siri_ride', leftColumn: 'siri_ride_id', rightColumn: 'id', type: 'INNER' })
    .withRelation({
      from: 'siri_ride_stop',
      to: 'siri_vehicle_location',
      leftColumn: 'nearest_siri_vehicle_location_id',
      rightColumn: 'id',
      type: 'LEFT',
    })
    .withRelation({ from: 'siri_ride_stop', to: 'gtfs_stop', leftColumn: 'gtfs_stop_id', rightColumn: 'id', type: 'LEFT' })
    .withRelation({ from: 'siri_ride', to: 'gtfs_ride', leftColumn: 'gtfs_ride_id', rightColumn: 'id', type: 'LEFT' })
    .withRelation({ from: 'gtfs_ride', to: 'gtfs_route', leftColumn: 'gtfs_route_id', rightColumn: 'id', type: 'LEFT' })
    .leftJoin('gtfs_ride_stop', [
      // @ts-expect-error Hypequery accepts qualified joined columns, but its types only allow base-table keys.
      ['gtfs_ride.id', 'gtfs_ride_stop.gtfs_ride_id'],
      ['gtfs_stop.id', 'gtfs_ride_stop.gtfs_stop_id'],
    ]);
  query = integers(query, 'siri_ride_stop.siri_stop_id', 'siri_stop_ids', input.siri_stop_ids);
  query = integers(query, 'siri_ride_stop.siri_ride_id', 'siri_ride_ids', input.siri_ride_ids);
  query = bounds(
    query,
    'siri_vehicle_location.lon',
    input.siri_vehicle_location__lon__greater_or_equal,
    input.siri_vehicle_location__lon__lower_or_equal,
  );
  query = bounds(
    query,
    'siri_vehicle_location.lat',
    input.siri_vehicle_location__lat__greater_or_equal,
    input.siri_vehicle_location__lat__lower_or_equal,
  );
  query = timeRange(
    query,
    'siri_vehicle_location.recorded_at_time',
    input.siri_vehicle_location__recorded_at_time_from,
    input.siri_vehicle_location__recorded_at_time_to,
  );
  query = timeRange(query, 'siri_ride.scheduled_start_time', input.siri_ride__scheduled_start_time_from, input.siri_ride__scheduled_start_time_to);
  query = bounds(query, 'gtfs_stop.lon', input.gtfs_stop__lon__greater_or_equal, input.gtfs_stop__lon__lower_or_equal);
  query = bounds(query, 'gtfs_stop.lat', input.gtfs_stop__lat__greater_or_equal, input.gtfs_stop__lat__lower_or_equal);
  query = dateRange(query, 'gtfs_route.date', input.gtfs_date_from, input.gtfs_date_to);
  query = dateRange(query, 'gtfs_stop.date', input.gtfs_date_from, input.gtfs_date_to);
  if (input.get_count) return count(query.count('siri_ride_stop.id', 'total'), reply);
  return list(
    query.select([
      ...columns('siri_ride_stop', rideStops),
      ...columns('siri_stop', ['code'], 'siri_stop__'),
      ...columns('siri_ride', rides.slice(1), 'siri_ride__'),
      ...columns('gtfs_stop', ['date', 'code', 'lat', 'lon', 'name', 'city'], 'gtfs_stop__'),
      ...columns('siri_vehicle_location', locations.slice(1), 'nearest_siri_vehicle_location__'),
      ...columns(
        'gtfs_ride_stop',
        ['gtfs_stop_id', 'gtfs_ride_id', 'arrival_time', 'departure_time', 'stop_sequence', 'pickup_type', 'drop_off_type', 'shape_dist_traveled'],
        'gtfs_ride_stop__',
      ),
      ...columns('gtfs_ride', gtfsRide, 'gtfs_ride__'),
      ...columns('gtfs_route', gtfsRoute, 'gtfs_route__'),
    ]),
    { ...input, order_by: input.order_by || undefined },
    reply,
    'siri_ride_stop',
    rideStops,
  );
}

export async function getSiriRideStops(request: SchemaRequest<typeof schemas.getSiriRideStopsSchema.schema>, reply: FastifyReply) {
  return get(db().table('siri_ride_stop').select(rideStops).where('id', 'eq', String(request.query.id)).limit(1), reply);
}

export async function listSiriVehicleLocations(request: SchemaRequest<typeof schemas.listSiriVehicleLocationsSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  let query = db()
    .table('siri_vehicle_location')
    .withRelation({ from: 'siri_vehicle_location', to: 'siri_snapshot', leftColumn: 'siri_snapshot_id', rightColumn: 'id', type: 'INNER' })
    .withRelation({ from: 'siri_vehicle_location', to: 'siri_ride_stop', leftColumn: 'siri_ride_stop_id', rightColumn: 'id', type: 'INNER' })
    .withRelation({ from: 'siri_ride_stop', to: 'siri_ride', leftColumn: 'siri_ride_id', rightColumn: 'id', type: 'INNER' })
    .withRelation({ from: 'siri_ride', to: 'siri_route', leftColumn: 'siri_route_id', rightColumn: 'id', type: 'INNER' });
  query = integers(query, 'siri_vehicle_location.id', 'siri_vehicle_location_ids', input.siri_vehicle_location_ids);
  query = integers(query, 'siri_vehicle_location.siri_snapshot_id', 'siri_snapshot_ids', input.siri_snapshot_ids);
  query = integers(query, 'siri_vehicle_location.siri_ride_stop_id', 'siri_ride_stop_ids', input.siri_ride_stop_ids);
  query = integers(query, 'siri_ride.id', 'siri_rides__ids', input.siri_rides__ids);
  query = integers(query, 'siri_route.id', 'siri_routes__ids', input.siri_routes__ids);
  query = where(query, 'siri_route.line_ref', input.siri_routes__line_ref);
  query = where(query, 'siri_route.operator_ref', input.siri_routes__operator_ref);
  query = where(query, 'siri_ride.vehicle_ref', input.siri_ride__vehicle_ref);
  query = timeRange(query, 'siri_vehicle_location.recorded_at_time', input.recorded_at_time_from, input.recorded_at_time_to);
  query = timeRange(
    query,
    'siri_ride.scheduled_start_time',
    input.siri_rides__scheduled_start_time_from ?? input.siri_rides__schedualed_start_time_from,
    input.siri_rides__scheduled_start_time_to ?? input.siri_rides__schedualed_start_time_to,
  );
  query = bounds(query, 'siri_vehicle_location.lon', input.lon__greater_or_equal, input.lon__lower_or_equal);
  query = bounds(query, 'siri_vehicle_location.lat', input.lat__greater_or_equal, input.lat__lower_or_equal);
  if (input.get_count) return count(query.count('siri_vehicle_location.id', 'total'), reply);
  return list(
    query.select([
      ...columns('siri_vehicle_location', locations),
      ...columns('siri_snapshot', ['snapshot_id'], 'siri_snapshot__'),
      ...columns('siri_route', routes, 'siri_route__'),
      ...columns(
        'siri_ride',
        [
          'id',
          'journey_ref',
          'scheduled_start_time',
          'vehicle_ref',
          'first_vehicle_location_id',
          'last_vehicle_location_id',
          'duration_minutes',
          'gtfs_ride_id',
        ],
        'siri_ride__',
      ),
    ]),
    input,
    reply,
    'siri_vehicle_location',
    locations,
  );
}

export async function getSiriVehicleLocations(request: SchemaRequest<typeof schemas.getSiriVehicleLocationsSchema.schema>, reply: FastifyReply) {
  return get(db().table('siri_vehicle_location').select(locations).where('id', 'eq', String(request.query.id)).limit(1), reply);
}

export async function listSiriSnapshots(request: SchemaRequest<typeof schemas.listSiriSnapshotsSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  const query = prefix(db().table('siri_snapshot'), 'snapshot_id', input.snapshot_id_prefix);
  if (input.get_count) return count(query.count('id', 'total'), reply);
  return list(query.select(snapshots), input, reply, 'siri_snapshot', snapshots);
}

export async function getSiriSnapshots(request: SchemaRequest<typeof schemas.getSiriSnapshotsSchema.schema>, reply: FastifyReply) {
  return get(db().table('siri_snapshot').select(snapshots).where('id', 'eq', request.query.id).limit(1), reply);
}
