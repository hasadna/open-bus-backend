import type { TSchema } from 'typebox';

import type { IntrospectedSchema } from '../../analytics/schema.js';

type Table = keyof IntrospectedSchema;
type Column<T extends Table> = T extends Table ? keyof IntrospectedSchema[T] & string : never;

type JoinedColumns<Joins extends Record<string, Table>> = {
  [Alias in keyof Joins & string]: `${Alias}__${Column<Joins[Alias]>}`;
}[keyof Joins & string];

export type ClickHouseColumns<Tables extends Table, Joins extends Record<string, Table> = {}, Computed extends string = never> = Partial<
  Record<Column<Tables> | JoinedColumns<Joins> | Computed, TSchema>
>;
