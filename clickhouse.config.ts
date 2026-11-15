import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

import { defineConfig } from '@chkit/core';

import { getConnectionConfig } from './src/db/config.js';

if (existsSync('.env')) loadEnvFile('.env');
const clickhouse = getConnectionConfig();

export default defineConfig({
  entry: './src/db/schema/index.ts',
  outDir: './chkit',
  clickhouse,
});
