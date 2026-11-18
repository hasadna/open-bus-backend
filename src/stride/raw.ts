import type { CacheMark } from './cache.js';
import { Params } from './ch.js';
import { BadInput, BadRequest, DEFAULT_LIMIT, MAX_LIMIT } from './sql.js';

/**
 * The second mechanism. Seven endpoints are hand-written aggregate SQL upstream
 * rather than filter-and-sort over one table, so they cannot come from the
 * builder in sql.ts: they rename output fields, group, or join in shapes the
 * builder's field/related model cannot express.
 *
 * Upstream these live in routers that call `common.sql_route.list_`, which
 * wraps the router's own SQL as `select * from (<sql>) a order by … limit …`.
 * `wrap` below is that function. Two of its details are easy to miss:
 * `skip_order_by_id_field=True`, so none of these get the `id DESC` tiebreaker
 * the builder appends; and `get_count` returns the bare number as the whole
 * response body, not an object.
 */
export interface RawEndpointDef {
  path: string;
  /** The inner query, before limit/offset/order are wrapped around it. */
  build: (p: URLSearchParams, db: string, bound: Params) => string;
  /** Upstream's hardcoded `order_by` argument to `sql_route.list_`. */
  orderBy?: string;
  defaultLimit?: number;
  /** Upstream's own cap, where it differs from the global 15000. */
  maxLimit?: number;
  /** Upstream `allow_no_limit`: the response is unbounded. */
  allowNoLimit?: boolean;
  /** The router declares no `get_count` parameter, so FastAPI ignores one that is sent. */
  noGetCount?: boolean;
  /**
   * Per-field coercion applied after the query, reproducing what the router's
   * pydantic response model does to each value on the way out.
   */
  coerce?: Record<string, 'date' | 'string'>;
  /** Keys the response model declares, in declaration order. Absent ones are null. */
  shape?: string[];
  /** The parameters whose days end the window a response covers; see `windowEnd`. */
  windowEnd?: string[];
  /** For a window that runs on past the day its parameter names. */
  windowEndDaysLater?: number;
  cache?: CacheMark['cache'];
}

function requireParam(p: URLSearchParams, name: string): string {
  const v = p.get(name);
  if (v === null || v === '') throw new BadRequest(`${name}: field required`);
  return v;
}

function civilDate(raw: string, name: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new BadRequest(`${name}: not a date: ${raw}`);
  return raw;
}

function int(raw: string, name: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new BadRequest(`${name}: not an integer`);
  return n;
}

function float(raw: string, name: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new BadRequest(`${name}: not a number`);
  return n;
}

/** `date_from - timedelta(days=30)`, done on the calendar day rather than on an instant. */
function shiftDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Reproduces `common.sql_route.list_`. `allow_no_limit` endpoints emit no
 * limit at all; every other one asserts 0 < limit <= 15000 and the assertion
 * text is upstream's, because a client may be matching on it.
 */
export function wrap(def: RawEndpointDef, inner: string, p: URLSearchParams): { sql: string; isCount: boolean } {
  const getCount = !def.noGetCount && ['true', '1'].includes((p.get('get_count') ?? '').toLowerCase());
  if (getCount) return { sql: `SELECT count(1) FROM (${inner}) AS count`, isCount: true };

  if (def.allowNoLimit) return { sql: inner, isCount: false };

  const max = def.maxLimit ?? MAX_LIMIT;
  const rawLimit = p.get('limit');
  const limit = rawLimit ? Number(rawLimit) : (def.defaultLimit ?? DEFAULT_LIMIT);
  if (!Number.isInteger(limit) || limit <= 0 || limit > max)
    throw new BadInput(
      def.maxLimit
        ? `due to abuse, maximum limit per request is ${max} items, contact us if you need more`
        : 'due to abuse, limit must be between 1 and 15000, contact us if you need more',
    );
  const offset = Number(p.get('offset') ?? 0);
  const order = def.orderBy ? ` ORDER BY ${def.orderBy}` : '';
  const offsetSql = offset > 0 ? ` OFFSET ${offset}` : '';
  return { sql: `SELECT * FROM (${inner}) AS a${order} LIMIT ${limit}${offsetSql}`, isCount: false };
}

/** `and agg.gtfs_route_date >= … and rt.date between date_from ± 30 days`, shared by both gtfs_rides_agg endpoints. */
function aggWhere(p: URLSearchParams, bound: Params): string {
  const dateFrom = civilDate(requireParam(p, 'date_from'), 'date_from');
  const dateTo = civilDate(requireParam(p, 'date_to'), 'date_to');
  const wheres = [
    'agg.gtfs_route_id = rt.id',
    `agg.gtfs_route_date >= ${bound.bind(dateFrom, 'Date')}`,
    `agg.gtfs_route_date <= ${bound.bind(dateTo, 'Date')}`,
    `rt.date >= ${bound.bind(shiftDays(dateFrom, -30), 'Date')}`,
    `rt.date <= ${bound.bind(shiftDays(dateTo, 30), 'Date')}`,
  ];
  const exFrom = p.get('exclude_hours_from');
  const exTo = p.get('exclude_hours_to');
  // Upstream guards with `if exclude_hours_from:`, so hour 0 is falsy and does nothing.
  if (exFrom && int(exFrom, 'exclude_hours_from') !== 0) wheres.push(`NOT (toHour(agg.gtfs_route_hour) >= ${int(exFrom, 'exclude_hours_from')})`);
  if (exTo && int(exTo, 'exclude_hours_to') !== 0) wheres.push(`NOT (toHour(agg.gtfs_route_hour) <= ${int(exTo, 'exclude_hours_to')})`);
  return wheres.join('\n  AND ');
}

const GROUP_BY_FIELDS = ['gtfs_route_date', 'gtfs_route_hour', 'operator_ref', 'day_of_week', 'line_ref'];

export const rawEndpoints: RawEndpointDef[] = [
  {
    // Not routed through sql_route upstream: the router puts limit and offset
    // inside its own SQL and orders by date, agency_name.
    // `order by date, agency_name` upstream, which is PostgreSQL's glibc
    // collation; see `collate` in sql.ts for why that is two expressions here.
    path: '/gtfs_agencies/list',
    windowEnd: ['date_to'],
    allowNoLimit: true,
    noGetCount: true,
    shape: ['date', 'operator_ref', 'agency_name'],
    build: (p, db, bound) => {
      const wheres: string[] = [];
      const from = p.get('date_from');
      const to = p.get('date_to');
      if (from) wheres.push(`date >= ${bound.bind(civilDate(from, 'date_from'), 'Date')}`);
      if (to) wheres.push(`date <= ${bound.bind(civilDate(to, 'date_to'), 'Date')}`);
      const limit = p.get('limit') ? int(p.get('limit')!, 'limit') : DEFAULT_LIMIT;
      const offset = Number(p.get('offset') ?? 0);
      return `
        SELECT date, operator_ref, agency_name
        FROM ${db}.gtfs_route
        ${wheres.length ? `WHERE ${wheres.join(' AND ')}` : ''}
        GROUP BY date, operator_ref, agency_name
        ORDER BY date,
                 replaceRegexpAll(agency_name, '[^\\pL\\pN]', '') COLLATE 'he',
                 agency_name COLLATE 'he'
        LIMIT ${limit} OFFSET ${offset}`;
    },
  },
  {
    path: '/gtfs_rides_agg/list',
    windowEnd: ['date_to'],
    defaultLimit: 1000,
    orderBy: 'gtfs_route_hour asc, gtfs_route_id asc',
    coerce: { gtfs_route_hour: 'date' },
    shape: ['gtfs_route_id', 'gtfs_route_hour', 'num_planned_rides', 'num_actual_rides', 'operator_ref'],
    build: (p, db, bound) => `
      SELECT
          agg.gtfs_route_id AS gtfs_route_id,
          agg.gtfs_route_hour AS gtfs_route_hour,
          agg.num_planned_rides AS num_planned_rides,
          agg.num_actual_rides AS num_actual_rides,
          rt.operator_ref AS operator_ref
      FROM ${db}.gtfs_rides_agg_by_hour AS agg, ${db}.gtfs_route AS rt
      WHERE ${aggWhere(p, bound)}`,
  },
  {
    path: '/gtfs_rides_agg/group_by',
    windowEnd: ['date_to'],
    allowNoLimit: true,
    coerce: { gtfs_route_date: 'date', gtfs_route_hour: 'date' },
    shape: [
      'gtfs_route_date',
      'gtfs_route_hour',
      'operator_ref',
      'day_of_week',
      'line_ref',
      'route_short_name',
      'route_long_name',
      'total_routes',
      'total_planned_rides',
      'total_actual_rides',
    ],
    build: (p, db, bound) => {
      const fields = requireParam(p, 'group_by')
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
      const bad = fields.filter((f) => !GROUP_BY_FIELDS.includes(f));
      if (bad.length) throw new BadInput(`Invalid group_by fields: ${JSON.stringify(fields)}. Valid values: ${GROUP_BY_FIELDS.join(', ')}.`);
      const select: string[] = [];
      const groupBy: string[] = [];
      for (const field of fields) {
        let expr: string;
        if (field === 'gtfs_route_date' || field === 'gtfs_route_hour') {
          expr = `agg.${field}`;
        } else if (field === 'day_of_week') {
          // Upstream: trim(lower(to_char(agg.gtfs_route_hour, 'DAY'))).
          expr = `lower(dateName('weekday', agg.gtfs_route_hour))`;
        } else {
          expr = `rt.${field}`;
          if (field === 'line_ref') {
            // json_agg(distinct x)::text, which sorts by value and separates with ", ".
            select.push(
              `arrayStringConcat(arrayMap(v -> concat('"', v, '"'), arraySort(groupUniqArray(rt.route_short_name))), ', ') AS route_short_name_inner`,
            );
            select.push(
              `arrayStringConcat(arrayMap(v -> concat('"', v, '"'), arraySort(groupUniqArray(rt.route_long_name))), ', ') AS route_long_name_inner`,
            );
          }
        }
        select.push(`${expr} AS ${field}`);
        groupBy.push(expr);
      }
      // Upstream's SQL has no ORDER BY; Postgres groups by sorting, so clients
      // have always received the rows in group order.
      const jsonWrap = select.some((s) => s.endsWith('AS route_short_name_inner'));
      const outer = jsonWrap
        ? `SELECT * EXCEPT (route_short_name_inner, route_long_name_inner),
                  concat('[', route_short_name_inner, ']') AS route_short_name,
                  concat('[', route_long_name_inner, ']') AS route_long_name
           FROM (`
        : 'SELECT * FROM (';
      return `${outer}
        SELECT
            ${select.join(',\n            ')},
            count(1) AS total_routes,
            sum(agg.num_planned_rides) AS total_planned_rides,
            sum(agg.num_actual_rides) AS total_actual_rides
        FROM ${db}.gtfs_rides_agg_by_hour AS agg, ${db}.gtfs_route AS rt
        WHERE ${aggWhere(p, bound)}
        GROUP BY ${groupBy.join(', ')})
        ORDER BY ${fields.join(', ')}`;
    },
  },
  {
    path: '/rides_execution/list',
    windowEnd: ['date_to'],
    defaultLimit: 100,
    orderBy: 'planned_start_time asc, actual_start_time asc',
    shape: ['planned_start_time', 'actual_start_time', 'gtfs_ride_id'],
    build: (p, db, bound) => {
      const dateFrom = civilDate(requireParam(p, 'date_from'), 'date_from');
      const dateTo = civilDate(requireParam(p, 'date_to'), 'date_to');
      const operatorRef = int(requireParam(p, 'operator_ref'), 'operator_ref');
      const lineRef = int(requireParam(p, 'line_ref'), 'line_ref');
      // `date_trunc('day', t AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jerusalem')`
      // is the calendar day in Israel, which is 23 or 25 hours long twice a year.
      const day = (col: string) => `toDate(toTimeZone(${col}, 'Asia/Jerusalem'))`;
      const from = bound.bind(dateFrom, 'Date');
      const to = bound.bind(dateTo, 'Date');
      return `
        SELECT
            actual_rides.start_time AS actual_start_time,
            planned_rides.start_time AS planned_start_time,
            planned_rides.gtfs_ride_id AS gtfs_ride_id
        FROM (
            SELECT siri_ride.scheduled_start_time AS start_time
            FROM ${db}.siri_ride AS siri_ride
            INNER JOIN ${db}.siri_route AS sr ON siri_ride.siri_route_id = sr.id
            WHERE sr.operator_ref = ${operatorRef}
              AND sr.line_ref = ${lineRef}
              AND ${day('siri_ride.scheduled_start_time')} BETWEEN ${from} AND ${to}
        ) AS actual_rides
        FULL OUTER JOIN (
            SELECT gtfs_ride.start_time AS start_time, gtfs_ride.id AS gtfs_ride_id
            FROM ${db}.gtfs_ride AS gtfs_ride
            INNER JOIN ${db}.gtfs_route AS gr ON gtfs_ride.gtfs_route_id = gr.id
            WHERE gr.operator_ref = ${operatorRef}
              AND gr.line_ref = ${lineRef}
              AND ${day('gtfs_ride.start_time')} BETWEEN ${from} AND ${to}
        ) AS planned_rides
        ON actual_rides.start_time = planned_rides.start_time`;
    },
  },
  {
    path: '/route_timetable/list',
    windowEnd: ['planned_start_time_date_to'],
    // `gtfs_line_ref` and `gtfs_ride_id` are declared `str` on the response
    // model although both columns are integers, so pydantic renders them quoted.
    coerce: { gtfs_line_ref: 'string', gtfs_ride_id: 'string' },
    shape: ['id', 'name', 'city', 'lon', 'lat', 'planned_arrival_time', 'gtfs_line_ref', 'gtfs_line_start_time', 'gtfs_ride_id'],
    build: (p, db, bound) => {
      const from = p.get('planned_start_time_date_from');
      const to = p.get('planned_start_time_date_to');
      const lineRefs = p.get('line_refs');
      if (!lineRefs && !(from && to)) throw new BadInput('please select either line_refs or both planned_start_time_from and planned_start_time_to');
      const wheres: string[] = [];
      if (from && to) {
        const span = Date.parse(from) - 0 - (Date.parse(to) - 0);
        if (Math.abs(span) > 86_400_000) throw new BadInput('planned_start_time_date_from/to interval must be lower than 1 day');
      }
      if (from) wheres.push(`gr.start_time >= ${bound.bind(instant(from), 'DateTime')}`);
      if (to) wheres.push(`gr.start_time <= ${bound.bind(instant(to), 'DateTime')}`);
      if (lineRefs) {
        const list = lineRefs
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        if (list.length > 1000) throw new BadRequest('too many items in list, maximum allowed is 1000 items');
        if (list.length) wheres.push(`rt.line_ref IN (${list.map((v) => int(v, 'line_refs')).join(', ')})`);
      }
      return `
        SELECT
            gs.id AS id,
            gs.name AS name,
            gs.city AS city,
            gs.lon AS lon,
            gs.lat AS lat,
            grs.arrival_time AS planned_arrival_time,
            rt.line_ref AS gtfs_line_ref,
            gr.start_time AS gtfs_line_start_time,
            gr.id AS gtfs_ride_id
        FROM ${db}.gtfs_stop AS gs
        INNER JOIN ${db}.gtfs_ride_stop AS grs ON grs.gtfs_stop_id = gs.id
        INNER JOIN ${db}.gtfs_ride AS gr ON gr.id = grs.gtfs_ride_id
        INNER JOIN ${db}.gtfs_route AS rt ON rt.id = gr.gtfs_route_id
        ${wheres.length ? `WHERE ${wheres.join('\n          AND ')}` : ''}
        ORDER BY grs.arrival_time ASC`;
    },
  },
  {
    path: '/stop_arrivals/list',
    shape: ['actual_arrival_time'],
    build: (p, db) => {
      const wheres: string[] = [];
      const stopId = p.get('gtfs_stop_id');
      const rideIds = p.get('gtfs_ride_ids');
      if (stopId) wheres.push(`srs.gtfs_stop_id = ${int(stopId, 'gtfs_stop_id')}`);
      if (rideIds) {
        const list = rideIds
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        if (list.length > 1000) throw new BadRequest('too many items in list, maximum allowed is 1000 items');
        if (list.length)
          wheres.push(
            `srs.siri_ride_id IN (SELECT siri_ride_id FROM ${db}.siri_ride_gtfs\n               WHERE route_gtfs_ride_id IN (${list.map((v) => int(v, 'gtfs_ride_ids')).join(', ')}))`,
          );
      }
      // Written as a prefiltered IN rather than upstream's join tree, because
      // ClickHouse hashes a join's right side whole: joining
      // siri_vehicle_location (6.5 billion rows) by id exceeded the 4 GiB
      // ceiling and never returned. Restricting it to the ids the stop can
      // produce answers in 0.159 s, and the `id_minmax` skip index on that
      // table is what makes the IN cheap.
      return `
        SELECT vl.recorded_at_time AS actual_arrival_time
        FROM ${db}.siri_vehicle_location AS vl
        WHERE vl.id IN (
            SELECT srs.nearest_siri_vehicle_location_id
            FROM ${db}.siri_ride_stop AS srs
            WHERE srs.nearest_siri_vehicle_location_id IS NOT NULL
              ${wheres.length ? `AND ${wheres.join('\n              AND ')}` : ''}
        )
        ORDER BY vl.recorded_at_time ASC`;
    },
    // Upstream caps this one at 100, not at the global 15000.
    maxLimit: 100,
  },
  {
    path: '/siri_velocity_aggregation/siri_velocity_aggregation',
    windowEnd: ['recorded_from'],
    windowEndDaysLater: 1,
    allowNoLimit: true,
    shape: ['rounded_lon', 'rounded_lat', 'total_sample_count', 'average_rolling_avg', 'stddev_rolling_avg'],
    build: (p, db, bound) => {
      const from = bound.bind(instant(requireParam(p, 'recorded_from')), 'DateTime');
      const precision = p.get('rounding_precision') ? int(p.get('rounding_precision')!, 'rounding_precision') : 2;
      if (precision < 0 || precision > 10) throw new BadRequest('rounding_precision: must be between 0 and 10');
      const lonMin = p.get('lon_min') ? float(p.get('lon_min')!, 'lon_min') : 34.25;
      const lonMax = p.get('lon_max') ? float(p.get('lon_max')!, 'lon_max') : 35.7;
      const latMin = p.get('lat_min') ? float(p.get('lat_min')!, 'lat_min') : 29.5;
      const latMax = p.get('lat_max') ? float(p.get('lat_max')!, 'lat_max') : 33.33;
      const scale = `pow(2, ${precision})`;
      // Upstream rounds with `(x * 2^p + 0.5)::INT`, a cast that rounds half
      // away from zero on top of the added half, then divides by 2^p.
      const round = (col: string) => `toInt64(round(${col} * ${scale} + 0.5)) / ${scale}`;
      return `
        SELECT
            rounded_lon,
            rounded_lat,
            count() AS total_sample_count,
            avg(rolling_average) AS average_rolling_avg,
            stddevSamp(rolling_average) AS stddev_rolling_avg
        FROM (
            SELECT
                rounded_lon,
                rounded_lat,
                avg(velocity) OVER (
                    PARTITION BY rounded_lon, rounded_lat
                    ORDER BY recorded_at_time
                    ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING
                ) AS rolling_average
            FROM (
                SELECT
                    ${round('lon')} AS rounded_lon,
                    ${round('lat')} AS rounded_lat,
                    velocity,
                    recorded_at_time
                FROM ${db}.siri_vehicle_location
                WHERE velocity > 0
                  AND velocity < 200
                  AND lon BETWEEN ${lonMin} AND ${lonMax}
                  AND lat BETWEEN ${latMin} AND ${latMax}
                  AND recorded_at_time BETWEEN ${from} AND ${from} + INTERVAL 1 DAY
            )
        )
        GROUP BY rounded_lon, rounded_lat
        ORDER BY rounded_lon, rounded_lat`;
    },
  },
];

/**
 * These routers take their datetimes through FastAPI's own parser rather than
 * through SQLAlchemy's tz-required binding, so an offset-less value is accepted
 * here and read as UTC, unlike the builder's `datetime_from`.
 */
function instant(raw: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/.exec(raw);
  if (!m) throw new BadRequest(`unparseable date/time: ${raw}`);
  const [, day, time, offset] = m;
  const seconds = time.length === 5 ? `${time}:00` : time;
  if (!offset || offset === 'Z') return `${day} ${seconds}`;
  const sign = offset[0] === '-' ? -1 : 1;
  const [oh, om] = offset.slice(1).replace(':', '').match(/\d{2}/g)!;
  const shifted = new Date(Date.parse(`${day}T${seconds}Z`) - sign * (Number(oh) * 60 + Number(om)) * 60_000);
  return shifted.toISOString().slice(0, 19).replace('T', ' ');
}
