import fastify from 'fastify';
import { afterEach, describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

import { swaggerConfig } from '../src/config/swagger.config.js';
import { getConnectionConfig } from '../src/db/config.js';
import { createDatabaseClient } from '../src/db/index.js';
import { registerRoutes } from '../src/routes/index.js';
import { transitSpec } from '../src/stride/openapi.js';
import { createRegistry } from '../src/stride/registry.js';
import { transitRoutes } from '../src/stride/routes.js';
import { buildQuery } from '../src/stride/sql.js';

function responseSchema(path) {
  const response = transitSpec.paths[path].get.responses['200'].content['application/json'].schema;
  let row = response.items ?? response;
  if (row.$ref) row = transitSpec.components.schemas[row.$ref.split('/').at(-1)];
  return row;
}
function sampleRow(path) {
  return Object.fromEntries(
    Object.entries(responseSchema(path).properties ?? {}).map(([key, original]) => {
      const schema = original.$ref ? transitSpec.components.schemas[original.$ref.split('/').at(-1)] : original;
      return [
        key,
        schema.enum?.[0] ??
          (schema.type === 'integer' || schema.type === 'number'
            ? 1
            : schema.format === 'date'
              ? '2026-05-20'
              : schema.format === 'date-time'
                ? '2026-05-20T10:00:00+00:00'
                : 'sample'),
      ];
    }),
  );
}
const defaultRow = Object.assign({}, ...Object.keys(transitSpec.paths).map(sampleRow));

const params = new URLSearchParams({
  id: '1',
  date_from: '2026-05-20',
  date_to: '2026-05-20',
  operator_ref: '3',
  line_ref: '1',
  line_refs: '1',
  group_by: 'operator_ref',
  gtfs_ride_ids: '1',
  recorded_from: '2026-05-20T00:00:00Z',
});

describe('STRIDE transit API', () => {
  let app;
  let calls;
  let rows;
  let count;
  let closed;
  let failure;

  async function setup() {
    calls = [];
    rows = [{ ...defaultRow }];
    count = '42\n';
    closed = false;
    failure = undefined;
    app = fastify();
    await app.register(import('@fastify/swagger'), swaggerConfig);
    registerRoutes(app, {
      database: 'external_stride',
      client: {
        async query(options) {
          calls.push(options);
          if (failure) throw failure;
          return { json: async () => rows, text: async () => count };
        },
        async close() {
          closed = true;
        },
      },
    });
    await app.ready();
  }

  afterEach(async () => {
    await app?.close();
  });

  for (const path of Object.keys(transitSpec.paths)) {
    it(`serves ${path} through a read-only query`, async () => {
      await setup();
      rows = [sampleRow(path)];
      const response = await app.inject(`${path}?${params}`);
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(calls.length, 1);
      assert.match(calls[0].query.trim(), /^SELECT\b/);
      assert.match(calls[0].query, /external_stride/);
      assert.ok(calls[0].abort_signal instanceof AbortSignal);
      assert.ok(response.headers['cache-control']);
      assert.equal(Array.isArray(response.json()), !path.endsWith('/get'));
    });
  }

  it('documents exactly the 27 transit paths together with existing routes', async () => {
    await setup();
    assert.equal(Object.keys(transitSpec.paths).length, 27);
    const document = (await app.inject('/openapi.json')).json();
    for (const [path, item] of Object.entries(transitSpec.paths)) {
      assert.equal(document.paths[path].get.summary, item.get.summary);
      assert.deepEqual(document.paths[path].get.parameters.map((p) => p.name).sort(), item.get.parameters.map((p) => p.name).sort());
      assert.ok(document.paths[path].get.responses['200']);
    }
    assert.ok(document.paths['/issues/create']);
    assert.ok(document.paths['/complaints/send']);
    assert.equal((await app.inject('/')).statusCode, 200);
    assert.equal((await app.inject({ method: 'POST', url: '/issues/create', payload: {} })).statusCode, 400);
  });

  it('preserves UTC timestamps, microseconds, bare dates and unmatched joins', async () => {
    await setup();
    rows = [{ ...sampleRow('/siri_rides/list'), scheduled_start_time: '2026-05-20 10:00:00.123456', gtfs_ride_id: null }];
    let response = await app.inject('/siri_rides/list');
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json()[0].scheduled_start_time, '2026-05-20T10:00:00.123456+00:00');
    assert.equal(response.json()[0].gtfs_ride_id, null);
    rows[0].scheduled_start_time = '2026-05-20 10:00:00.000000';
    response = await app.inject('/siri_rides/list');
    assert.equal(response.json()[0].scheduled_start_time, '2026-05-20T10:00:00+00:00');
    rows = [sampleRow('/gtfs_stops/list')];
    assert.equal((await app.inject('/gtfs_stops/list')).json()[0].date, '2026-05-20');
  });

  it('shapes aggregates and coerces timetable IDs without exposing extra fields', async () => {
    await setup();
    rows = [{ id: 1, gtfs_ride_id: 55, gtfs_line_ref: 9, internal: 'hidden' }];
    const row = (await app.inject('/route_timetable/list?line_refs=9')).json()[0];
    assert.equal(row.gtfs_ride_id, '55');
    assert.equal(row.gtfs_line_ref, '9');
    assert.equal(row.city, null);
    assert.equal('internal' in row, false);
    rows = [{ ...sampleRow('/gtfs_rides_agg/list'), gtfs_route_hour: '2026-05-20 10:00:00' }];
    const aggregate = await app.inject('/gtfs_rides_agg/list?date_from=2026-05-20&date_to=2026-05-20');
    assert.equal(aggregate.json()[0].gtfs_route_hour, '2026-05-20');
  });

  it('returns bare JSON counts with precision intact for list and aggregate queries', async () => {
    await setup();
    count = '9007199254740993\n';
    for (const path of ['/siri_routes/list', '/gtfs_rides_agg/list']) {
      const response = await app.inject(`${path}?${params}&get_count=true`);
      assert.equal(response.body, '9007199254740993');
      assert.match(response.headers['content-type'], /application\/json/);
      assert.match(calls.at(-1).query, /count/i);
      assert.match(calls.at(-1).query, /count\(/i);
    }
  });

  it('binds text filters and exact Int64 get IDs outside SQL', async () => {
    await setup();
    const attack = "x' OR 1=1 --";
    const response = await app.inject(`/gtfs_stops/list?city=${encodeURIComponent(attack)}`);
    assert.equal(response.statusCode, 200);
    assert.equal(calls[0].query.includes(attack), false);
    assert.ok(Object.values(calls[0].query_params).includes(attack));
    await app.inject('/siri_routes/get?id=9007199254740993');
    assert.equal(calls.at(-1).query_params.id, '9007199254740993');
    assert.match(calls.at(-1).query, /\{id:Int64\}/);
  });

  it('applies pagination, ordering and bounded-join filters', async () => {
    await setup();
    await app.inject('/siri_routes/list?line_refs=1,2&limit=7&offset=3&order_by=line_ref%20desc');
    assert.match(calls[0].query, /line_ref IN \(1, 2\)/);
    assert.match(calls[0].query, /ORDER BY.*line_ref.*DESC,.*id.*DESC/s);
    assert.match(calls[0].query, /LIMIT 7\s+OFFSET 3/);
    await app.inject('/siri_vehicle_locations/list?recorded_at_time_from=2026-05-20T10:00:00.001%2B03:00');
    assert.ok(Object.values(calls.at(-1).query_params).includes('2026-05-20 07:00:01'));
  });

  it('uses the first repeated query value without changing validation status codes', async () => {
    await setup();
    const response = await app.inject('/siri_routes/list?line_refs=1&line_refs=bad&limit=2&limit=bad');
    assert.equal(response.statusCode, 200, response.body);
    assert.match(calls[0].query, /line_ref IN \(1\)/);
    assert.match(calls[0].query, /LIMIT 2/);
  });

  it('preserves collation SQL and passes text arrays as native ClickHouse parameters', async () => {
    await setup();
    let response = await app.inject('/siri_snapshots/list?order_by=snapshot_id%20desc');
    assert.equal(response.statusCode, 200, response.body);
    assert.match(calls[0].query, /COLLATE 'he'/);
    assert.match(calls[0].query, /sn.id DESC/);
    const values = ["ride'one", 'ride?two'];
    response = await app.inject(`/siri_rides/list?journey_refs=${encodeURIComponent(values.join(','))}`);
    assert.equal(response.statusCode, 200, response.body);
    assert.match(calls.at(-1).query, /\{p\d+:Array\(String\)\}/);
    assert.deepEqual(Object.values(calls.at(-1).query_params), [values]);
    assert.equal(calls.at(-1).query.includes(values[0]), false);
  });

  it('quotes reserved selected column names in get queries', async () => {
    await setup();
    assert.equal((await app.inject('/siri_ride_stops/get?id=1')).statusCode, 200);
    assert.match(calls[0].query, /`order`/);
  });

  for (const [url, status] of [
    ['/siri_routes/get', 422],
    ['/siri_routes/get?id=1%20OR%201=1', 422],
    ['/siri_routes/list?line_refs=abc', 422],
    ['/siri_routes/list?limit=15001', 422],
    ['/siri_routes/list?order_by=unknown', 500],
    ['/gtfs_stops/list?date_from=invalid', 422],
    ['/siri_rides/list?scheduled_start_time_from=2026-05-20T10:00:00', 500],
    ['/gtfs_ride_stops/list', 400],
    ['/route_timetable/list', 400],
    ['/gtfs_rides_agg/list', 422],
    ['/gtfs_rides_agg/group_by?date_from=2026-05-20&date_to=2026-05-20&group_by=invalid', 400],
    ['/stop_arrivals/list?limit=101', 400],
    ['/siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=2026-05-20T00:00:00Z&rounding_precision=11', 422],
  ]) {
    it(`rejects ${url} with ${status} before contacting ClickHouse`, async () => {
      await setup();
      const response = await app.inject(url);
      assert.equal(response.statusCode, status, response.body);
      assert.equal(calls.length, 0);
    });
  }

  it('returns 404 for missing IDs and an empty array for empty lists', async () => {
    await setup();
    rows = [];
    const missing = await app.inject('/gtfs_stops/get?id=1');
    assert.equal(missing.statusCode, 404);
    assert.deepEqual(missing.json(), { detail: 'Not Found' });
    assert.deepEqual((await app.inject('/gtfs_stops/list')).json(), []);
  });

  it('hides database errors and does not cache failures', async () => {
    await setup();
    failure = new Error('private database credentials and SQL');
    const response = await app.inject('/siri_routes/list');
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.json(), { detail: 'query failed' });
    assert.equal(response.headers['cache-control'], undefined);
  });

  it('closes its connection on Fastify shutdown', async () => {
    await setup();
    assert.equal(closed, false);
    await app.close();
    assert.equal(closed, true);
  });

  it('rejects unsafe database identifiers before creating a client', async () => {
    app = fastify();
    app.register(transitRoutes, { database: 'stride; DROP TABLE x' });
    await assert.rejects(app.ready(), /SQL identifier/);
  });

  it('cancels a running query when the HTTP client disconnects', async function () {
    this.timeout(5000);
    let started;
    let aborted;
    const queryStarted = new Promise((resolve) => {
      started = resolve;
    });
    const queryAborted = new Promise((resolve) => {
      aborted = resolve;
    });
    app = fastify();
    registerRoutes(app, {
      database: 'stride',
      client: {
        query({ abort_signal }) {
          started();
          return new Promise((_resolve, reject) => {
            abort_signal.addEventListener(
              'abort',
              () => {
                aborted();
                reject(abort_signal.reason);
              },
              { once: true },
            );
          });
        },
        async close() {},
      },
    });
    await app.listen({ host: '127.0.0.1', port: 0 });
    const request = http.get(`${app.listeningOrigin}/siri_routes/list`);
    request.on('error', () => {});
    try {
      await Promise.race([
        queryStarted,
        delay(2000).then(() => {
          throw new Error('Query did not start');
        }),
      ]);
      request.destroy();
      await Promise.race([
        queryAborted,
        delay(2000).then(() => {
          throw new Error('Query was not cancelled');
        }),
      ]);
    } finally {
      request.destroy();
    }
  });
});

describe('ClickHouse query transport', () => {
  it('requires connection settings and accepts an explicitly empty password', () => {
    const original = { ...process.env };
    try {
      for (const key of ['CLICKHOUSE_URL', 'CLICKHOUSE_USER', 'CLICKHOUSE_PASSWORD', 'CLICKHOUSE_DB']) {
        process.env[key] = 'test';
      }
      process.env.CLICKHOUSE_PASSWORD = '';
      assert.equal(getConnectionConfig().password, '');
      for (const key of ['CLICKHOUSE_URL', 'CLICKHOUSE_USER', 'CLICKHOUSE_PASSWORD', 'CLICKHOUSE_DB']) {
        const value = process.env[key];
        delete process.env[key];
        assert.throws(getConnectionConfig, new RegExp(key));
        process.env[key] = value;
      }
    } finally {
      process.env = original;
    }
  });

  it('uses read-only settings and native bound parameters over HTTP', async () => {
    const original = { ...process.env };
    let received;
    let receivedSql = '';
    const server = http.createServer((request, response) => {
      received = new URL(request.url, 'http://localhost');
      request.setEncoding('utf8');
      request.on('data', (chunk) => {
        receivedSql += chunk;
      });
      request.on('end', () => response.end('{"id":1}\n'));
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    let client;
    try {
      Object.assign(process.env, {
        CLICKHOUSE_URL: `http://127.0.0.1:${server.address().port}`,
        CLICKHOUSE_USER: 'reader',
        CLICKHOUSE_PASSWORD: '',
        CLICKHOUSE_DB: 'stride',
      });
      client = createDatabaseClient();
      const result = await client.query({
        query: 'SELECT {id:Int64} AS id, {names:Array(String)} AS names',
        query_params: { id: '9007199254740993', names: ["x' OR 1=1 --", 'question?mark'] },
        format: 'JSONEachRow',
      });
      assert.deepEqual(await result.json(), [{ id: 1 }]);
      assert.ok(receivedSql.includes('{id:Int64}'));
      assert.equal(receivedSql.includes("x' OR 1=1 --"), false);
      assert.equal(received.searchParams.get('param_id'), '9007199254740993');
      assert.ok(received.searchParams.get('param_names').includes('question?mark'));
      for (const [key, value] of Object.entries({
        readonly: '2',
        max_execution_time: '30',
        max_memory_usage: '1610612736',
        join_use_nulls: '1',
        cancel_http_readonly_queries_on_client_close: '1',
        output_format_json_quote_64bit_integers: '0',
      })) {
        assert.equal(received.searchParams.get(key), value);
      }
    } finally {
      await client?.close();
      await new Promise((resolve) => server.close(resolve));
      process.env = original;
    }
  });

  it('keeps injected clients and shutdown isolated between applications', async () => {
    const closed = [];
    const apps = [fastify(), fastify()];
    try {
      for (const [index, app] of apps.entries()) {
        app.register(transitRoutes, {
          database: 'stride',
          client: {
            query: async () => ({ json: async () => [], text: async () => '0' }),
            close: async () => {
              closed.push(index);
            },
          },
        });
        await app.ready();
      }
      await apps[0].close();
      assert.deepEqual(closed, [0]);
      await apps[1].close();
      assert.deepEqual(closed, [0, 1]);
    } finally {
      await Promise.all(apps.map((app) => app.close()));
    }
  });
});

const integration = process.env.RUN_CLICKHOUSE_TESTS === '1' ? describe : describe.skip;
integration('External stride-lite database (SELECT only)', () => {
  it('executes every endpoint query without provisioning or modifying data', async function () {
    this.timeout(120000);
    const app = fastify();
    registerRoutes(app);
    try {
      await app.ready();
      for (const path of Object.keys(transitSpec.paths)) {
        const response = await app.inject(`${path}?${params}&limit=1`);
        assert.ok([200, 404].includes(response.statusCode), `${path}: ${response.body}`);
      }
    } finally {
      await app.close();
    }
  });
});

describe('STRIDE SQL regression guards', () => {
  it('prunes joined observation lookups using bounded base filters', () => {
    const { endpoints } = createRegistry('stride');
    const def = endpoints.find((endpoint) => endpoint.path === '/siri_rides/list');
    const built = buildQuery(def, new URLSearchParams({ scheduled_start_time_from: '2026-05-20T00:00:00Z' }));
    assert.equal(built.sql.includes('__BASE_WHERE__'), false);
    assert.match(built.sql, /scheduled_start_time >= \{p\d+:DateTime\}/);
    assert.match(built.sql, /SELECT/);
  });
});
