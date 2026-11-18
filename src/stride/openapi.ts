import { readFileSync } from 'node:fs';

/** API contract only; no schema, migration, or server filesystem dependencies. */
export const transitSpec = JSON.parse(readFileSync(new URL('./openapi.json', import.meta.url), 'utf8'));
