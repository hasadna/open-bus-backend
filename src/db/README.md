# External ClickHouse connection

This directory contains connection configuration and a read-only query client.
Database provisioning, schemas, migrations, ingestion, backfills, and refresh jobs
are managed outside this repository.

## Configuration

Set these variables in the process environment or an ignored local .env:

CLICKHOUSE_URL=https://your-clickhouse-host:8443
CLICKHOUSE_USER=api_reader
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DB=stride

All four settings are required at server startup. An explicitly empty password
is accepted. The database name must match [A-Za-z_][A-Za-z0-9_]*.
Use a dedicated read-only account with SELECT access to the tables and views
required by the stride-lite API. Provision that account outside this repository.
The client also sets readonly=2, a 30-second execution limit, a 35-second HTTP
timeout, and a 1.5 GiB query memory limit with aggregation and sort spilling.
The account's settings profile must permit these query settings.

## Database contract

The external database must already be populated and compatible with:
https://github.com/NoamGaash/stride-lite/tree/f262d0140c6fc8112c5bd408e663f64207abad10/db
and the views referenced by that revision's API registry and aggregate queries.
The old models previously managed here are not compatible substitutes.
Nothing in startup, build, or normal tests creates or changes database objects.

The process validates configuration at startup; availability is checked when
queries execute. The existing root health endpoint remains a process health check.
Database query errors return a generic 500 response and are logged server-side.

## Optional integration checks

Set RUN_CLICKHOUSE_TESTS=1 and the four connection settings, then run:

node --env-file-if-exists=.env --import=tsx node_modules/mocha/bin/mocha.js

These checks only issue SELECT queries against an externally prepared database.
They never provision fixtures, load archives, or apply migrations.
