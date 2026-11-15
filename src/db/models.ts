import { materializedView, table, type TableInput } from '@chkit/core';

import { required } from './config.js';

export function gtfsTable<const Input extends Pick<TableInput, 'name' | 'comment' | 'columns'>>(input: Input) {
  const definition = table({
    ...input,
    database: required('CLICKHOUSE_DB'),
    engine: 'MergeTree',
    primaryKey: ['id'],
    orderBy: ['id'],
  });
  return definition as typeof definition & Pick<Input, 'name' | 'columns'>;
}

export function refreshableModel<
  const Input extends Pick<TableInput, 'name' | 'comment' | 'columns' | 'orderBy'> & { as: string; dependsOn?: string[] },
>(input: Input) {
  const { as, dependsOn, ...target } = input;
  const database = required('CLICKHOUSE_DB');
  return {
    table: table({ ...target, database, engine: 'ReplacingMergeTree(calculated_at)' }) as ReturnType<typeof table> & Pick<Input, 'name' | 'columns'>,
    refresh: materializedView({
      database,
      name: `${target.name}_refresh`,
      comment: `Appends recalculated rows to ${target.name} every 10 minutes.`,
      to: { database, name: target.name },
      refresh: {
        every: '10 MINUTE',
        append: true,
        ...(dependsOn && { dependsOn: dependsOn.map((name) => ({ database, name })) }),
      },
      as,
    }),
  };
}
