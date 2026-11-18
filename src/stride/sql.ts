import type { CacheMark } from './cache.js';
import { Params } from './ch.js';

/**
 * Mirrors the filter vocabulary of open_bus_stride_api/routers/common.py.
 * `in` splits on commas and is capped at 1000 items by the upstream API.
 *
 * Upstream spells both granularities `datetime_from`/`datetime_to`, because
 * there the granularity comes from the column rather than the filter. The two
 * are split here because they are genuinely different contracts, which the
 * published spec states as `format: date` on 22 parameters and
 * `format: date-time` on 23: a date parameter takes `YYYY-MM-DD` and nothing
 * else, while a date-time parameter requires an offset and is converted to UTC.
 */
export type FilterType =
  | 'in'
  | 'equals'
  | 'datetime_from'
  | 'datetime_to'
  | 'date_from'
  | 'date_to'
  | 'greater_or_equal'
  | 'lower_or_equal'
  | 'prefix'
  | 'contains';

export interface FilterDef {
  /** Query-string parameter name, exactly as the production OpenAPI spec names it. */
  param: string;
  /** Fully qualified column, e.g. `vl.recorded_at_time`. */
  column: string;
  type: FilterType;
  /** Quote values as strings rather than passing them through as numbers. */
  text?: boolean;
  /**
   * The way in for a filter on a joined table: the base-table column it also
   * restricts, through `table`, whose `key` holds the filter's values.
   *
   * Without it the base table is read whole, because ClickHouse does not carry
   * a condition across a join, and on a table sorted by something else that is
   * every row. With it the base table gets a condition of its own, which its
   * sort key or a skip index can prune on. Declaring it is also a statement
   * that the filter is a lookup callers are expected to make; a filter without
   * one still works, at the cost of a full scan.
   */
  narrows?: { column: string; table: string; key: string };
}

/**
 * Describes where `prefix__field` response columns come from. Joins live in
 * `EndpointDef.joins` instead, because join order is constrained by alias
 * dependencies while response field order follows the published schema.
 */
export interface Related {
  prefix: string;
  alias: string;
  fields: string[];
}

export interface EndpointDef {
  path: string;
  cache?: CacheMark['cache'];
  table: string;
  alias: string;
  /** The SQLAlchemy model's class name, which appears in upstream error text. */
  model: string;
  /** Columns of the base table that appear in the response, in order. */
  fields: string[];
  related?: Related[];
  filters: FilterDef[];
  /**
   * Extra joins needed only to reach a related table.
   *
   * A join may contain `__BASE_WHERE__`, which is replaced with the filters
   * that apply to the base table alone. That is what lets a join read a
   * prefiltered subquery instead of the whole table: ClickHouse hashes a join's
   * right side whole, so joining siri_vehicle_location (6.5 billion rows) by id
   * exceeds any memory ceiling however few base rows there are. Restricting the
   * right side to the ids the base filter can produce is the documented
   * two-stage shape, expressed in one statement.
   *
   * Only base-table filters can go in there, because the other aliases do not
   * exist inside the subquery. When a request filters on nothing but a joined
   * table, the prefilter degenerates to the whole table and the query is as
   * heavy as upstream's.
   */
  joins?: string[];
  /**
   * `order_by` fields whose SQL is not simply the base table's own column.
   * Every field in `fields` is orderable as `<alias>.<field>` regardless, since
   * upstream resolves the name with getattr on the model.
   */
  orderable?: Record<string, string>;
  /**
   * Which of those are text columns. They sort differently: see `collate`.
   */
  textOrder?: string[];
  /**
   * The default of the endpoint's `order_by` parameter. Absent means the
   * endpoint declares no such parameter, in which case one sent by a caller is
   * ignored, exactly as FastAPI ignores an undeclared query parameter.
   */
  orderByDefault?: string;
  /** Upstream `skip_order_by`: the endpoint emits no `ORDER BY` at all. */
  skipOrderBy?: boolean;
  /** The endpoint's own guard, run before any SQL is built. */
  validate?: (params: URLSearchParams) => void;
}

export const DEFAULT_LIMIT = 100;
export const MAX_LIMIT = 15000;

export class BadRequest extends Error {}

/**
 * An endpoint's own guard, raised upstream as `HTTPException(status_code=400)`.
 * Kept apart from BadRequest because that is FastAPI's own validation and
 * answers 422; these are hand-written checks and answer 400.
 */
export class BadInput extends Error {}

/**
 * Upstream rejects an offset-less date-time inside SQLAlchemy rather than in
 * validation, so it surfaces as a 500 carrying this message, not as a 422.
 */
/**
 * `order_by` is resolved with `getattr(db_model, field_name)`, so an unknown
 * field raises AttributeError and production answers 500 with this message —
 * which also means a related table's field cannot be ordered by, only the base
 * table's own columns.
 */
export class UnknownOrderField extends Error {
  constructor(model: string, field: string) {
    super(`type object '${model}' has no attribute '${field}'`);
  }
}

export class TzRequired extends Error {
  constructor() {
    super('(builtins.TypeError) tzinfo is required');
  }
}

function filterSql(f: FilterDef, raw: string, params: Params): string | null {
  const num = (v: string) => {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new BadRequest(`${f.param}: not a number`);
    return n;
  };
  switch (f.type) {
    case 'in': {
      const values = raw
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '');
      if (values.length === 0) return null;
      if (values.length > 1000) throw new BadRequest('too many items in list, maximum allowed is 1000 items');
      if (f.text) return `${f.column} IN ${params.bind(values, 'Array(String)')}`;
      return `${f.column} IN (${values.map(num).join(', ')})`;
    }
    case 'equals':
      return `${f.column} = ${f.text ? params.bind(raw, 'String') : num(raw)}`;
    case 'datetime_from':
      return `${f.column} >= ${params.bind(parseInstant(raw, 'up'), 'DateTime')}`;
    case 'datetime_to':
      return `${f.column} <= ${params.bind(parseInstant(raw, 'down'), 'DateTime')}`;
    case 'date_from':
      return `${f.column} >= ${params.bind(parseCivilDate(raw), 'Date')}`;
    case 'date_to':
      return `${f.column} <= ${params.bind(parseCivilDate(raw), 'Date')}`;
    case 'greater_or_equal':
      return `${f.column} >= ${f.text ? params.bind(raw, 'String') : num(raw)}`;
    case 'lower_or_equal':
      return `${f.column} <= ${f.text ? params.bind(raw, 'String') : num(raw)}`;
    case 'prefix':
      return `${f.column} LIKE ${params.bind(`${raw}%`, 'String')}`;
    case 'contains':
      return `${f.column} LIKE ${params.bind(`%${raw}%`, 'String')}`;
  }
}

/** A `format: date` parameter takes a calendar day and nothing else. */
function parseCivilDate(raw: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new BadRequest(`not a date: ${raw}`);
  return raw;
}

const INSTANT = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,6}))?(Z|[+-]\d{2}:?\d{2})?$/;

/**
 * Upstream stores these columns naive and relabels them UTC on the way out, so
 * a filter value is converted to UTC and then stripped of its offset. The
 * offset is required: `DateTimeWithTimeZone.process_bind_param` raises on a
 * naive value, which production returns as a 500 rather than a 422.
 *
 * Every column these filters compare against is second-granular `DateTime`, and
 * a literal carrying a fraction is a `TYPE_MISMATCH` against one --- which the
 * frontend walks straight into, because `Date.toISOString()` always writes
 * `.000Z`. So a bound is rounded to the side that leaves the comparison exact
 * over whole seconds: a lower bound up, an upper bound down. Rounding rather
 * than casting the literal keeps it a plain `DateTime`, so the primary index
 * still prunes on it.
 */
function parseInstant(raw: string, round: 'up' | 'down'): string {
  const m = INSTANT.exec(raw);
  if (!m) throw new BadRequest(`unparseable date/time: ${raw}`);
  const [, y, mo, d, hh, mm, ss, frac, offset] = m;
  if (!offset) throw new TzRequired();

  let offsetMinutes = 0;
  if (offset !== 'Z') {
    const sign = offset[0] === '-' ? -1 : 1;
    const [oh, om] = offset.slice(1).replace(':', '').match(/\d{2}/g)!;
    offsetMinutes = sign * (Number(oh) * 60 + Number(om));
  }

  const utc = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss ?? 0)) - offsetMinutes * 60_000);
  if (round === 'up' && frac !== undefined && Number(frac) !== 0) {
    utc.setUTCSeconds(utc.getUTCSeconds() + 1);
  }
  return utc.toISOString().slice(0, 19).replace('T', ' ');
}

export interface BuildResult {
  sql: string;
  isCount: boolean;
  params: Record<string, unknown>;
}

export function buildQuery(def: EndpointDef, params: URLSearchParams): BuildResult {
  def.validate?.(params);
  const getCount = ['true', '1'].includes((params.get('get_count') ?? '').toLowerCase());

  const bound = new Params();
  const where: string[] = [];
  for (const f of def.filters) {
    const raw = params.get(f.param);
    if (raw === null || raw === '') continue;
    const clause = filterSql(f, raw, bound);
    if (!clause) continue;
    where.push(clause);
    if (f.narrows) {
      const { column, table, key } = f.narrows;
      where.push(`${column} IN (SELECT id FROM ${table} WHERE ${filterSql({ ...f, column: key }, raw, bound)})`);
    }
  }

  // The alias is stripped because the substituted condition lands inside a
  // subquery over the base table itself, where the outer alias is not in scope:
  // ClickHouse rejects a correlated subquery as an IN argument.
  const baseWhere = where.filter((c) => c.startsWith(`${def.alias}.`)).map((c) => c.split(`${def.alias}.`).join(''));
  const joins = (def.joins ?? []).map((j) => j.replace(/__BASE_WHERE__/g, baseWhere.length ? baseWhere.join(' AND ') : '1'));
  const from = [`FROM ${def.table} AS ${def.alias}`, ...joins];
  const whereSql = where.length ? `\nWHERE ${where.join('\n  AND ')}` : '';

  if (getCount) {
    return { sql: `SELECT count() ${from.join('\n')}${whereSql}`, isCount: true, params: bound.values };
  }

  // Field names are quoted because `siri_ride_stop.order` is a reserved word.
  const select = [
    ...def.fields.map((f) => `${def.alias}.\`${f}\` AS \`${f}\``),
    ...(def.related ?? []).flatMap((r) => r.fields.map((f) => `${r.alias}.\`${f}\` AS \`${r.prefix}${f}\``)),
  ];

  const limit = parseLimit(params.get('limit'));
  const order = buildOrderBy(def, params.get('order_by'));
  const offset = params.get('offset');
  const offsetSql = offset && Number(offset) > 0 ? `\nOFFSET ${Number(offset)}` : '';

  return {
    sql: `SELECT ${select.join(',\n       ')}\n${from.join('\n')}${whereSql}${order}\nLIMIT ${limit}${offsetSql}`,
    isCount: false,
    params: bound.values,
  };
}

function parseLimit(raw: string | null): number {
  if (raw === null || raw === '') return DEFAULT_LIMIT;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0 || n > MAX_LIMIT)
    throw new BadRequest('due to abuse, maximum limit per request is 15000 items, contact us if you need more');
  return n;
}

/**
 * Upstream ordering has three shapes, and which one an endpoint gets is decided
 * by how its handler is declared rather than by anything the caller sends:
 * `skip_order_by` emits no `ORDER BY`; an endpoint that declares no `order_by`
 * parameter always orders by `id DESC`; and one that declares the parameter
 * falls back to its default, which is `'id asc'` everywhere except
 * `/siri_ride_stops/list`, where it is empty and so also yields `id DESC`.
 *
 * `id DESC` is appended as a tiebreaker unless the caller already ordered by
 * id, which is what makes order deterministic and the comparison possible.
 */
/**
 * PostgreSQL sorts text through the database's glibc collation, which compares
 * in two passes: first ignoring punctuation and whitespace, then, for strings
 * equal under that, comparing them in full. ClickHouse compares bytes, and
 * `COLLATE 'he'` does not help because ICU treats punctuation as significant by
 * default. Measured on `/gtfs_agencies/list`, where the two orders disagree:
 * production puts "ירושלים - עיסאוויה…" after "ירושלים-דרום…", a byte sort puts
 * it before, and this expression reproduces production's order on all 20 rows.
 */
function collate(expr: string, dir: string): string[] {
  return [`replaceRegexpAll(${expr}, '[^\\pL\\pN]', '') ${dir} COLLATE 'he'`, `${expr} ${dir} COLLATE 'he'`];
}

function buildOrderBy(def: EndpointDef, sent: string | null): string {
  if (def.skipOrderBy) return '';
  const raw = def.orderByDefault === undefined ? '' : (sent ?? def.orderByDefault);
  const parts: string[] = [];
  let hasId = false;
  for (const piece of raw.split(',')) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    const [field, direction] = trimmed.split(/\s+/);
    const expr = def.orderable?.[field] ?? (def.fields.includes(field) ? `${def.alias}.${field}` : undefined);
    if (!expr) throw new UnknownOrderField(def.model, field);
    if (field.toLowerCase() === 'id') hasId = true;
    const dir = direction === 'desc' ? 'DESC' : 'ASC';
    if (def.textOrder?.includes(field)) {
      parts.push(...collate(expr, dir));
    } else {
      parts.push(`${expr} ${dir}`);
    }
  }
  if (!hasId) parts.push(`${def.alias}.id DESC`);
  return parts.length ? `\nORDER BY ${parts.join(', ')}` : '';
}

/**
 * Reproduces the guard in `gtfs_ride_stops.list_`, including two details that
 * are easy to lose: the guard is skipped only when `gtfs_ride_ids` holds a
 * *single* id, so a comma-separated list still needs the time range; and the
 * upstream check is `timedelta.days > 30`, which truncates, so 30 days plus a
 * second passes and only 31 whole days fails.
 */
export function requireBoundedArrivalWindow(params: URLSearchParams): void {
  const rideIds = params.get('gtfs_ride_ids');
  if (rideIds && !rideIds.includes(',')) return;

  const from = params.get('arrival_time_from');
  const to = params.get('arrival_time_to');
  if (!from || !to) {
    throw new BadInput('arrival_time_from and arrival_time_to are required');
  }
  const span = Date.parse(`${parseInstant(to, 'down')}Z`) - Date.parse(`${parseInstant(from, 'up')}Z`);
  if (Math.floor(span / 86_400_000) > 30) {
    throw new BadInput('Time range is longer than 30 days');
  }
}
