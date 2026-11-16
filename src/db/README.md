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

### TODO: Fix ride duration calculation

Yes—the current value measures tracking duration, which can differ from the actual ride duration.

- Before the first stop or after the last: those observations are included. They can inflate the duration. Missing observations near either endpoint can shorten it.
- Crossing midnight: full timestamps handle this correctly—23:50 to 00:30 is 40 minutes. However, the ride can split if data_frame_ref changes, because it forms part of siri_ride_id.

A better calculation would:

1. Match the SIRI ride to its GTFS trip.
2. Identify departure from the first stop and arrival at the last, using coordinates and stop progression.
3. Keep the same trip identity across midnight.
4. Return NULL or mark the result incomplete when either endpoint lacks enough evidence.

I’d preserve the current value as observed tracking duration and calculate estimated trip duration separately. Stop proximity alone cannot establish an exact departure or arrival time

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

## SIRI archive ingestion

Ingestion lives in `src/db/ingest-siri.ts`; its database transformation is
`src/db/sql/ingest-siri.sql`. Its typed schema and two `ARRAY JOIN`s follow the
[upstream STRIDE ingestion macro](https://github.com/hasadna/open-bus-stride-clickhouse/blob/main/stride_dbt/macros/ingest_siri_vehicle_location.sql),
adapted to standalone SQL without dbt. The CLI uses Hypequery's exported
`ClickHouseConnection` to create its underlying official ClickHouse client,
executes the SQL with `client.command()` and native query parameters, and closes
that client in `finally`. No additional dependency is needed. Use Node 22+ and
the four `CLICKHOUSE_*` settings above.
The existing `siri_vehicle_location` table must exist. Ingestion works with the
original monthly partitions and does not require a partition migration.

```sh
npm run db:ingest:siri -- 2026-11-11
npm run db:ingest:siri -- 2026-11-11 2026-11-14
```

The first date is required; the end date is optional and defaults to the first
date. Dates are inclusive UTC archive dates, irrespective of the local timezone. Like
the upstream macro, each date gets one `INSERT ... SELECT FROM url(...)`, with:

```text
https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/YYYY/MM/DD/{00..23}/{00..59}.br
```

ClickHouse expands the hours and minutes itself and inserts missing observations directly
to `siri_vehicle_location`. The CLI only validates dates and submits SQL. It has no
minute option or minute loop. The command does not create tables, replace
partitions, or delete existing rows.

ClickHouse downloads and decompresses Brotli in its own memory, reads each document
with a typed nested `JSONEachRow` schema, validates timestamps, and expands visits
into observations. The backend only sends SQL and receives results; it never
receives archive bytes or saves archive files. ClickHouse needs outbound HTTPS and
permission to use `url`; ingestion needs SELECT and INSERT on the existing table, without
CREATE, DROP or ALTER privileges. Public HTTP reads do not require credentials or
bucket listing. MergeTree persists the resulting rows normally.

SQL uses at most two processing/download threads and 1 GiB of tracked query memory.
The anti join compares incoming observations with rows stored for the same archive
day. `max_bytes_before_external_join` triggers spilling at 256 MiB, while
`max_bytes_in_join = 0` disables the separate hard join cap. ClickHouse partitions
the join and spills to its own temporary storage; archive bytes never pass through
the backend. The 1 GiB overall query memory limit still applies.
Each daily query has a one-hour client timeout and requests progress headers every
10 seconds to help keep long-running HTTP connections alive. Timestamp offsets are parsed into
UTC. New snapshot IDs use `YYYY/MM/DD/HH/mm`, without `.br`. Existing IDs ending
in `.br` are recognized by the duplicate check without rewriting those stored rows.
ClickHouse computes alias columns;
missing vehicle coordinates remain empty strings, matching the string payload
contract.

### Failed imports

A failed query is logged on stderr with its date and error. The command continues
with later dates and exits nonzero if any date failed. Success prints a JSON line
with `day` and `status: "inserted"`. ClickHouse handles transport retries; the CLI
never automatically resubmits an INSERT after a failed or uncertain response.

Unlike upstream's unconditional append, this SQL uses a `LEFT ANTI JOIN` over all
16 input columns. Repeating a date or overlapping date ranges skips observations
already present. A failed daily query can leave committed rows; rerunning it fills
the missing observations without duplicating those rows, including when only part
of a snapshot was imported. Archives are still fetched on reruns. Modified payloads
are new rows, not updates. Existing duplicates are not removed.

The CLI uses a shared ClickHouse HTTP session per database. Concurrent CLI queries
using the same server and database user are rejected with a session-lock error
rather than inserting simultaneously; rerun a rejected command after the active
import finishes. Direct SQL calls and writers using other sessions or users must
be serialized separately, since MergeTree does not enforce a uniqueness constraint.
No additional tables or schema changes are needed.

### Compiled CLI and direct SQL

```sh
npm run build
node --env-file-if-exists=.env dist/src/db/ingest-siri.js 2026-11-11 2026-11-14
node --env-file-if-exists=.env dist/src/db/ingest-siri.js 2026-11-11
```

The build copies SQL assets into `dist/src/db/sql`. The same SQL can import a day
directly, without a local data file, dbt or the Node CLI:

```sh
clickhouse-client --database default --param_database=default \
  --param_source_url='https://openbus-stride-public.s3.eu-west-1.amazonaws.com/stride-siri-requester/2026/11/11/{00..23}/{00..59}.br' \
  --queries-file src/db/sql/ingest-siri.sql
```

### Verification

```sh
RUN_CLICKHOUSE_TESTS=1 npm run test:mocha
```

Integration tests create and drop an isolated test database with the original
monthly source table. An HTTP fixture server serves real Brotli bytes from memory;
ClickHouse fetches and parses them. Tests cover URL glob expansion, individual
file errors, UTC timestamps, aliases, direct SQL, empty snapshots, repeated and
overlapping imports, partial snapshots, legacy `.br` IDs and concurrent CLI calls.
A separate test checks that the CLI submits one query per date and
continues after a failed date, only contacting ClickHouse. Production ingestion
creates no tables.

The default fixture hostname is `host.docker.internal`. Set
`CLICKHOUSE_TEST_HTTP_HOST=127.0.0.1` when ClickHouse runs on the test host, or another
address reachable from ClickHouse as needed. Existing derived models process only
the recent 9–10 days; importing older raw rows does not rebuild older derived history.
