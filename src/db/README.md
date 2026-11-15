# STRIDE ClickHouse models

Schema management uses [chkit](https://chkit.obsessiondb.com/); application queries
use [@hypequery/clickhouse](https://hypequery.com/docs/quick-start), backed by the
official `@clickhouse/client` transport.
Both run on Node with npm/npx. The installed chkit release requires Node 22 or newer.

The five derived SIRI models come from
[stride_dbt/models](https://github.com/hasadna/open-bus-stride-clickhouse/tree/be30dfe82660aa5745169f1601f49c9fca4f125c/stride_dbt/models),
with dbt macros expanded into SQL. The four GTFS tables come from the
[STRIDE SQLAlchemy models](https://github.com/hasadna/open-bus-stride-db/tree/main/open_bus_stride_db/model).
The `siri_vehicle_location` source table comes from the
[STRIDE ClickHouse migrations](https://github.com/hasadna/open-bus-stride-clickhouse/tree/be30dfe82660aa5745169f1601f49c9fca4f125c/migrations)
at the same pinned revision, including its eight computed aliases and scheduled-start-time index.
Storage differs from upstream: `operator_ref`, `data_frame_ref`, and `stop_order`
use `LowCardinality(String)` for dictionary encoding. The table default codec is
`ZSTD(1)`; `recorded_at_time` overrides it with `Delta(4), ZSTD(1)`. Values,
computed identifiers, and string ingestion payloads retain their upstream meaning.

## Schema layout

Each model is defined under `schema/`. `clickhouse.config.ts` loads the named
exports from `schema/index.ts`. `models.ts` supplies shared table settings and
refresh definitions; `config.ts` validates connection settings without creating
a client. Import `index.ts` only when a runtime database client is needed.

- `gtfs_stop` stores dated stop details.
- `gtfs_ride_stop` stores stop sequences along trips.
- `siri_ride_stop_gtfs_stop` maps SIRI ride stops to GTFS stops.
- `siri_vehicle_location` stores raw SIRI observations with upstream string coordinates,
  snapshot-based partitions, and a primary key and sort order on `recorded_at_time`.
  Its aliases derive journey, route, ride, stop, and observation identifiers without
  adding fields to the ingestion payload.

These models have different purposes. The upstream `gtfs_stop_mot_id` mapping
is omitted because current queries do not use MOT identifier aliases.

GTFS tables use `MergeTree`, ordered and keyed by upstream `id`. ClickHouse
primary keys neither enforce uniqueness nor generate IDs. Non-primary-key GTFS
columns are nullable; dates use `Date32`, and upstream UTC timestamps use
`DateTime64(6, 'UTC')`. Foreign keys are documented in column comments.

`siri_ride` is a normal view. Each other SIRI model has a target table using
`ReplacingMergeTree(calculated_at)` and a chkit materialized view named
`<model>_refresh`, with native `REFRESH EVERY 10 MINUTE APPEND` settings.
Stop matching tolerates repeated rows with the same ID and leaves ambiguous
same-day stop-code matches unresolved.

`siri_ride` aggregates vehicle observations and each refresh-history table to one
row per ride before joining, avoiding multiplication of observation and history
rows. Each history column keeps its own `argMax`, including its existing handling
of null values. Stop matching first groups GTFS rows by day and code; comparing
the minimum and maximum IDs detects ambiguity with constant-size aggregate state
and reduces the number of rows entering the join.

## Configuration and queries

Set the following in `.env` or the process environment:

```dotenv
CLICKHOUSE_URL=http://localhost:8123
CLICKHOUSE_USER=openbus
CLICKHOUSE_PASSWORD=backend
CLICKHOUSE_DB=default
```

An explicitly empty password is accepted; the other settings must be nonblank.
The chkit config loads `.env` when present. Runtime entry points must load the
environment before importing the client, as the existing npm start/dev scripts do.

```typescript
import { db } from './src/db/index.js';

const stops = await db.table('gtfs_stop').select(['id', 'name', 'code']).limit(10).execute();
await db.close(); // Close when the application shuts down.
```

`QuerySchema` derives table and column types from the chkit definitions using
type-only imports. Runtime queries do not load chkit or the schema modules.
Use `db.rawQuery<Row>(sql)` for views such as `siri_ride`, whose result columns
are defined by SQL rather than explicit table columns.

## Migrations

```sh
npm run db:generate -- --name describe_change
npm run db:migrate
```

These invoke `npx chkit generate` and `npx chkit migrate --apply`.
Generated SQL lives in `chkit/migrations/` and schema state in `chkit/meta/`.
Review SQL before applying it.

The initial migration creates the GTFS tables, SIRI source table, and SIRI target
tables before dependent views. Source-table creation is managed here; ingestion
and backfills remain external. Populate GTFS tables before refreshing the SIRI models.
The server must support refreshable materialized views.

For an existing source table, generated `MODIFY COLUMN` operations convert the
three dictionary-encoded columns and can rewrite their stored data. Codec changes
apply to newly written or merged parts; old parts remain readable with their
original codecs. No forced full-table recompression is required. Review and
schedule the migration for the size of the deployed table before applying it.

Use `npm run typecheck` to validate TypeScript and `npm run test:mocha` for the
application test suite. Generating a migration does not contact ClickHouse.

To run the database query regression tests against a configured ClickHouse server
in PowerShell:

```powershell
$env:RUN_CLICKHOUSE_TESTS = '1'
node --env-file-if-exists=.env --import=tsx node_modules/mocha/bin/mocha.js
Remove-Item Env:RUN_CLICKHOUSE_TESTS
```

These tests execute only SELECT queries over inline fixtures. They compare the
optimized queries with their original forms, including missing matches, nullable
history values, duplicate stop IDs, ambiguous codes, and time-window filters.
Without `RUN_CLICKHOUSE_TESTS=1`, the database tests are skipped.

The `optimize_siri_joins` migration recreates the two affected views and retains
their target tables. Applying it briefly interrupts those views; review and apply
it through the normal migration workflow.
