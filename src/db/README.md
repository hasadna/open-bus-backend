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
tables before dependent views. Source-table creation and SIRI archive ingestion
are managed here. Populate GTFS tables before refreshing the SIRI models.
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

## SIRI archive ingestion

Ingestion lives in `src/db/ingest-siri.ts`; the database transformation is
`src/db/sql/ingest-siri.sql`. No separate backfill service or directory is needed.
Use Node 22+ and the same four `CLICKHOUSE_*` settings above:

```sh
npm run db:ingest:siri -- --date 2026-11-15
npm run db:ingest:siri -- --from 2026-11-01 --to 2026-11-15
```

Dates are inclusive **UTC archive dates**, irrespective of the local timezone.
Each day enumerates 1,440 zero-padded `YYYY/MM/DD/HH/mm.br` keys under
`https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/`.
Files are fetched sequentially, decompressed with Node's Brotli implementation,
validated, and expanded into observations by ClickHouse SQL. Timestamp offsets
are parsed into UTC. Snapshot IDs retain `YYYY/MM/DD/HH/mm.br`; distinct snapshots
retain their observations even if the vehicle data repeats. Alias columns are
computed by ClickHouse. Missing vehicle coordinates, which occur in the archive,
are retained as empty strings to match the source table's string payload contract.

A unique staging table holds each day. Only after all downloads and inserts
succeed does `REPLACE PARTITION` atomically refresh the live day. Repeated runs and
overlapping ranges replace data instead of appending duplicates. Concurrent runs
use separate staging tables; the last successful replacement wins as a complete
snapshot of that day, with no mixed or duplicate appends. No cross-day transaction
is implied. Other writers must use this daily replacement protocol too.

HTTP 404s are reported individually on stderr and counted in the daily JSON
summary. A successful refresh contains the snapshots available during that run;
previous observations from now-missing files are removed. HTTP 403s and other
errors are failures, not missing files. Transient request failures, HTTP 429s and
5xx responses receive up to three download attempts. Invalid JSON, Brotli, SIRI
error responses, invalid timestamps, insert failures, and entirely empty days
preserve the previous day and produce a nonzero exit status. Other requested days
are still processed. Inserts are never blindly retried after uncertain outcomes.
A lost replacement acknowledgement may mean the day was committed: rerunning the
date safely refreshes it again.

Staging tables are dropped on normal success or failure. A killed process can
leave a `siri_ingest_<uuid>` table; after confirming its process has stopped,
remove that table manually. Live data remains either the previous or refreshed
day. Cleanup errors also cause a nonzero exit status.

### Daily partition migration

The ingestion command refuses the original monthly-partitioned table. The
`siri_daily_partitions` chkit migration creates a daily-partitioned copy, copies
existing observations, then atomically exchanges table names. It replaces the
generator's destructive drop/create plan. This migration requires an **Atomic**
database, room for both copies, stopped ingestion writers, and paused refreshable
views during the maintenance window. The SQL uses `default`, matching the initial
migration; for another database, review and substitute its qualified identifiers
in both migrations before applying them.

After applying through `npm run db:migrate`, verify counts, derived aliases,
indexes, dependent views and daily partitions, then resume refreshable views and
writers. The original monthly table remains as `siri_vehicle_location_daily` for
rollback. Before new ingestion begins, exchanging the names again restores it.
After new ingestion, rollback also requires reconciling newly refreshed data.
Do not blindly rerun an interrupted migration: before exchange, the incomplete
copy can be dropped and rebuilt; after exchange, retain and inspect the backup.
Drop the backup only after verification. The schema snapshot now describes daily
partitioning so subsequent generated migrations agree with the live schema.

The database account needs CREATE/DROP TABLE, SELECT, INSERT and ALTER privileges
in the configured database. No production migration or archive import is run by
building or testing this project.

The build copies SQL assets into `dist/src/db/sql`. A compiled CLI is available:

```sh
npm run build
node --env-file-if-exists=.env dist/src/db/ingest-siri.js --date 2026-11-15
```

For direct SQL use, feed a decompressed JSON document with ClickHouse's
`JSONAsString` input format. This example inserts into an existing **staging** table;
publish its complete day using the same atomic replacement protocol as the CLI:

```sh
clickhouse-client --database default --param_database=default \
  --param_table=my_siri_staging --param_snapshot=2026/11/15/12/00.br \
  --query "$(cat src/db/sql/ingest-siri.sql)" < snapshot.json
```

Run database integration tests against a disposable local ClickHouse instance:

```sh
RUN_CLICKHOUSE_TESTS=1 npm run test:mocha
```

These tests create and drop an isolated database, exercise the monthly-to-daily
migration, repeat and concurrently refresh dates, verify UTC timestamps and alias
values, preserve other days, and recover from failed downloads and lost commit
acknowledgements. Archive HTTP responses use fixtures; SQL executes on ClickHouse.
Existing refreshable models still limit derived processing to the recent 9–10
days: ingesting older raw data does not recalculate older derived history.
