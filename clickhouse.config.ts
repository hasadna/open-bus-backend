import { defineConfig } from '@chkit/core';
import { pull } from '@chkit/plugin-pull';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} to the supplied connection value`);
  return value;
}

const database = required('CLICKHOUSE_DB');
const password = process.env.CLICKHOUSE_PASSWORD;
if (password === undefined) throw new Error('Set CLICKHOUSE_PASSWORD (explicitly empty if supplied that way)');

export default defineConfig({
  schema: './src/db/schema/**/*.ts',
  outDir: './chkit',
  clickhouse: {
    url: required('CLICKHOUSE_URL'),
    username: required('CLICKHOUSE_USER'),
    password,
    database,
  },
  plugins: [pull({ databases: [database], outFile: './src/db/schema/pulled.ts' })],
});
