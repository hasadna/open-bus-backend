import type { EndpointDef } from './sql.js';

const MINUTE = 60;
const DAY_SECONDS = 24 * 60 * MINUTE;
const DAY_MS = DAY_SECONDS * 1000;

/** Older data is settled, so it may be kept longer. Newest first. */
const BY_AGE = [
  { olderThanDays: 30, seconds: 2 * DAY_SECONDS },
  { olderThanDays: 7, seconds: DAY_SECONDS },
] as const;
const RECENT_SECONDS = 15 * MINUTE;

/** `none` keeps an endpoint out of every cache, for one whose answers are still changing. */
export type CacheMark = { cache?: 'none' };

export function cacheControl(def: CacheMark, end: number | undefined, now = Date.now()): string {
  if (def.cache === 'none') return 'no-store';
  const age = end === undefined ? 0 : now - end;
  const rule = BY_AGE.find((r) => age > r.olderThanDays * DAY_MS);
  return `max-age=${rule?.seconds ?? RECENT_SECONDS}`;
}

/**
 * The end of the latest day any of `params` names. Day-granular on purpose: it
 * only has to tell a week from a month, and rounding up to the day's end never
 * makes a window look older than it is. Undefined when none was sent, or one
 * cannot be read, because a request with no end reaches the present.
 */
export function windowEnd(params: readonly string[], p: URLSearchParams, daysLater = 0): number | undefined {
  const days = params.map((name) => p.get(name)).filter((v) => v !== null && v !== '');
  if (days.length === 0) return undefined;
  const ends = days.map((v) => Date.parse(v!.slice(0, 10)) + (1 + daysLater) * DAY_MS);
  return ends.some(Number.isNaN) ? undefined : Math.max(...ends);
}

/** A list endpoint's upper time bounds. */
export function listEnds(def: EndpointDef): string[] {
  return def.filters.filter((f) => f.type === 'datetime_to' || f.type === 'date_to').map((f) => f.param);
}
