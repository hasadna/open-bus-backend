import type { FastifyReply } from 'fastify';
import { Readable } from 'node:stream';

import type * as schemas from '../schemas/analytics.schema.js';
import type { SchemaRequest } from '../types.js';
import { badRequest, integerList, serializeRow, transitClient, type Query, type Row } from './transit-query.js';

type Parameters = Record<string, string | number | number[]>;
type Page = { limit?: number; offset?: number; get_count?: boolean };

function run(query: string, query_params: Parameters) {
  return transitClient().query({ query, query_params, format: 'JSONEachRow' });
}

async function rows(query: string, params: Parameters) {
  return (await (await run(query, params)).json<Row>()).map(serializeRow);
}

async function page(query: string, params: Parameters, order: string, input: Page, reply: FastifyReply, defaultLimit = 100) {
  if (input.get_count) {
    const [result] = await rows(`SELECT count() AS total FROM (${query})`, params);
    return reply.send(Number(result.total));
  }
  const { limit = defaultLimit, offset = 0 } = input;
  if (!Number.isSafeInteger(limit) || limit < -1 || limit > 500_000 || !Number.isSafeInteger(offset) || offset < 0) {
    throw badRequest('Invalid limit or offset');
  }
  if (limit === 0) return [];
  const result = await run(`${query} ORDER BY ${order} LIMIT {limit:UInt64} OFFSET {offset:UInt64}`, {
    ...params,
    limit: limit === -1 ? 500_000 : limit,
    offset,
  });
  if (limit !== -1) return (await result.json<Row>()).map(serializeRow);

  const stream = result.stream<Row>();
  async function* json() {
    yield '[';
    let separator = '';
    try {
      for await (const batch of stream) {
        for (const row of batch as { json(): Row }[]) {
          yield separator + JSON.stringify(serializeRow(row.json()));
          separator = ',';
        }
      }
      yield ']';
    } finally {
      stream.destroy();
    }
  }
  return reply.type('application/json').send(Readable.from(json()));
}

export async function listRouteTimetable(request: SchemaRequest<typeof schemas.listRouteTimetableSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  const { planned_start_time_date_from: from, planned_start_time_date_to: to } = input;
  const lines = integerList(input.line_refs, 'line_refs');
  if (!lines && !(from && to)) throw badRequest('Supply line_refs or both planned start time bounds');
  if (from && to && Date.parse(to) - Date.parse(from) > 86_400_000) throw badRequest('Planned start time range must be at most one day');

  const filters = [];
  const params: Parameters = {};
  if (from !== undefined) {
    filters.push("ride.start_time >= fromUnixTimestamp64Milli({start_from:Int64}, 'UTC')");
    params.start_from = Date.parse(from);
  }
  if (to !== undefined) {
    filters.push("ride.start_time <= fromUnixTimestamp64Milli({start_to:Int64}, 'UTC')");
    params.start_to = Date.parse(to);
  }
  if (lines) {
    filters.push('route.line_ref IN {line_refs:Array(Int64)}');
    params.line_refs = lines;
  }
  return page(
    `
    SELECT stop.id AS id, stop.name AS name, stop.city AS city, stop.lon AS lon, stop.lat AS lat,
           ride_stop.arrival_time AS planned_arrival_time, toString(route.line_ref) AS gtfs_line_ref,
           ride.start_time AS gtfs_line_start_time, toString(ride.id) AS gtfs_ride_id
    FROM gtfs_ride_stop AS ride_stop
    INNER JOIN gtfs_stop AS stop ON stop.id = ride_stop.gtfs_stop_id
    INNER JOIN gtfs_ride AS ride ON ride.id = ride_stop.gtfs_ride_id
    INNER JOIN gtfs_route AS route ON route.id = ride.gtfs_route_id
    WHERE ${filters.join(' AND ')}
  `,
    params,
    'planned_arrival_time, gtfs_ride_id, id',
    input,
    reply,
  );
}

export async function listStopArrivals(request: SchemaRequest<typeof schemas.listStopArrivalsSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  const rides = integerList(input.gtfs_ride_ids, 'gtfs_ride_ids');
  const filters = [];
  const params: Parameters = {};
  if (input.gtfs_stop_id !== undefined) {
    filters.push('stop.id = {stop_id:Int64}');
    params.stop_id = input.gtfs_stop_id;
  }
  if (rides) {
    filters.push('ride.route_gtfs_ride_id IN {ride_ids:Array(Int64)}');
    params.ride_ids = rides;
  }
  return page(
    `
    SELECT location.recorded_at_time AS actual_arrival_time
    FROM siri_ride_stop AS ride_stop
    INNER JOIN gtfs_stop AS stop ON stop.id = ride_stop.gtfs_stop_id
    INNER JOIN siri_vehicle_location AS location ON location.id = ride_stop.nearest_siri_vehicle_location_id
    INNER JOIN siri_ride AS ride ON ride.id = ride_stop.siri_ride_id
    ${filters.length ? 'WHERE ' + filters.join(' AND ') : ''}
  `,
    params,
    'actual_arrival_time',
    input,
    reply,
  );
}

export async function listRidesExecution(request: SchemaRequest<typeof schemas.listRidesExecutionSchema.schema>, reply: FastifyReply) {
  const input = request.query;
  const { date_from, date_to, line_ref, operator_ref } = input;
  return page(
    `
    SELECT planned.start_time AS planned_start_time, actual.start_time AS actual_start_time, planned.id AS gtfs_ride_id
    FROM (
      SELECT ride.id AS id, ride.start_time AS start_time
      FROM gtfs_ride AS ride
      INNER JOIN gtfs_route AS route ON route.id = ride.gtfs_route_id
      WHERE route.line_ref = {line_ref:Int64} AND route.operator_ref = {operator_ref:Int64}
        AND toDate(ride.start_time, 'Asia/Jerusalem') BETWEEN {date_from:Date32} AND {date_to:Date32}
    ) AS planned
    FULL OUTER JOIN (
      SELECT ride.scheduled_start_time AS start_time
      FROM siri_ride AS ride
      INNER JOIN siri_route AS route ON route.id = ride.siri_route_id
      WHERE route.line_ref = {line_ref:Int64} AND route.operator_ref = {operator_ref:Int64}
        AND toDate(ride.scheduled_start_time, 'Asia/Jerusalem') BETWEEN {date_from:Date32} AND {date_to:Date32}
    ) AS actual ON actual.start_time = planned.start_time
  `,
    { date_from, date_to, line_ref, operator_ref },
    'planned_start_time, actual_start_time, gtfs_ride_id',
    input,
    reply,
  );
}

export async function siriVelocityAggregation(request: SchemaRequest<typeof schemas.siriVelocityAggregationSchema.schema>) {
  const { recorded_from, lon_min = 34.25, lon_max = 35.7, lat_min = 29.5, lat_max = 33.33, rounding_precision = 2 } = request.query;
  return rows(
    `
    WITH pow(2, {rounding_precision:UInt8}) AS scale,
         fromUnixTimestamp64Milli({recorded_from:Int64}, 'UTC') AS start_time
    SELECT rounded_lon, rounded_lat, count() AS total_sample_count,
           avg(rolling_average) AS average_rolling_avg, stddevSampOrNull(rolling_average) AS stddev_rolling_avg
    FROM (
      SELECT toFloat64(round(toDecimal64(lon, 9) * toInt32(scale) + toDecimal64('0.5', 9))) / scale AS rounded_lon,
             toFloat64(round(toDecimal64(lat, 9) * toInt32(scale) + toDecimal64('0.5', 9))) / scale AS rounded_lat,
             avg(velocity) OVER (
               PARTITION BY rounded_lon, rounded_lat ORDER BY recorded_at_time, id
               ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING
             ) AS rolling_average
      FROM siri_vehicle_location
      WHERE velocity > 0 AND velocity < 200
        AND lon BETWEEN {lon_min:Float64} AND {lon_max:Float64}
        AND lat BETWEEN {lat_min:Float64} AND {lat_max:Float64}
        AND recorded_at_time BETWEEN start_time AND start_time + INTERVAL 1 DAY
    )
    GROUP BY rounded_lon, rounded_lat
    ORDER BY rounded_lon, rounded_lat
  `,
    { recorded_from: Date.parse(recorded_from), lon_min, lon_max, lat_min, lat_max, rounding_precision },
  );
}

function ridesAggregate(input: Omit<Query<typeof schemas.groupByGtfsRidesAggSchema>, 'group_by'>) {
  const { date_from, date_to, exclude_hours_from, exclude_hours_to } = input;
  const params: Parameters = { date_from, date_to };
  const filters = ['agg.gtfs_route_date >= {date_from:Date32} AND agg.gtfs_route_date < {date_to:Date32} + 1'];
  if (exclude_hours_from !== undefined) {
    filters.push('toHour(agg.gtfs_route_hour) < {exclude_hours_from:UInt8}');
    params.exclude_hours_from = exclude_hours_from;
  }
  if (exclude_hours_to !== undefined) {
    filters.push('toHour(agg.gtfs_route_hour) > {exclude_hours_to:UInt8}');
    params.exclude_hours_to = exclude_hours_to;
  }
  return {
    from: `FROM gtfs_rides_agg_by_hour AS agg
           INNER JOIN gtfs_route AS route ON route.id = agg.gtfs_route_id
           WHERE ${filters.join(' AND ')}`,
    params,
  };
}

export async function listGtfsRidesAgg(request: SchemaRequest<typeof schemas.listGtfsRidesAggSchema.schema>, reply: FastifyReply) {
  const { from, params } = ridesAggregate(request.query);
  return page(
    `
    SELECT agg.gtfs_route_id AS gtfs_route_id, toDate(agg.gtfs_route_hour) AS gtfs_route_hour,
           agg.num_planned_rides AS num_planned_rides, agg.num_actual_rides AS num_actual_rides, route.operator_ref AS operator_ref
    ${from}
  `,
    params,
    'agg.gtfs_route_hour, gtfs_route_id',
    request.query,
    reply,
    1000,
  );
}

const groupFields = new Map([
  ['gtfs_route_date', 'agg.gtfs_route_date'],
  ['gtfs_route_hour', 'agg.gtfs_route_hour'],
  ['operator_ref', 'route.operator_ref'],
  ['day_of_week', "lower(formatDateTime(agg.gtfs_route_hour, '%W'))"],
  ['line_ref', 'route.line_ref'],
]);

export async function groupByGtfsRidesAgg(request: SchemaRequest<typeof schemas.groupByGtfsRidesAggSchema.schema>) {
  const { from, params } = ridesAggregate(request.query);
  const fields = [
    ...new Set(
      request.query.group_by
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean),
    ),
  ];
  if (!fields.length) throw badRequest('Supply at least one group_by field');
  const expressions = fields.map((field) => {
    const expression = groupFields.get(field);
    if (!expression) throw badRequest(`Invalid group_by field: ${field}`);
    return expression;
  });
  const groups = fields.map((field, i) => {
    const expression = expressions[i];
    const value = field === 'gtfs_route_date' || field === 'gtfs_route_hour' ? `toDate(${expression})` : expression;
    return `${value} AS ${field}`;
  });
  if (fields.includes('line_ref')) {
    groups.push('toJSONString(arraySort(groupUniqArray(route.route_short_name))) AS route_short_name');
    groups.push('toJSONString(arraySort(groupUniqArray(route.route_long_name))) AS route_long_name');
  }
  return rows(
    `
    SELECT ${groups.join(', ')}, count() AS total_routes,
           sum(agg.num_planned_rides) AS total_planned_rides, sum(agg.num_actual_rides) AS total_actual_rides
    ${from}
    GROUP BY ${expressions.join(', ')}
    ORDER BY ${expressions.join(', ')}
  `,
    params,
  );
}
