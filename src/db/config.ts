export function required(name: string, { allowEmpty = false } = {}): string {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && value.trim() === '')) {
    throw new Error(`Missing ${name}. Set it in .env or your process environment.${allowEmpty ? ' An empty value is allowed.' : ''}`);
  }
  return value;
}

export function getConnectionConfig() {
  return {
    url: required('CLICKHOUSE_URL'),
    username: required('CLICKHOUSE_USER'),
    password: required('CLICKHOUSE_PASSWORD', { allowEmpty: true }),
    database: required('CLICKHOUSE_DB'),
  };
}
