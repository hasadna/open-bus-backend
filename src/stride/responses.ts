import type { RawEndpointDef } from './raw.js';

/** Match STRIDE's UTC ISO timestamps, including nonzero microseconds. */
export function normalize(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const match = typeof value === 'string' && /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?:\.(\d+))?$/.exec(value);
      if (!match) return [key, value];
      const micros = (match[3] ?? '').padEnd(6, '0').slice(0, 6);
      return [key, `${match[1]}T${match[2]}${micros === '000000' ? '' : `.${micros}`}+00:00`];
    }),
  );
}

export function shapeRow(def: RawEndpointDef, row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (def.coerce?.[key] === 'date' && typeof value === 'string') out[key] = value.slice(0, 10);
    else if (def.coerce?.[key] === 'string' && value !== null && value !== undefined) out[key] = String(value);
  }
  return def.shape ? Object.fromEntries(def.shape.map((key) => [key, out[key] ?? null])) : out;
}
