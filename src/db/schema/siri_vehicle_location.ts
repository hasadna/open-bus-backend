import { table, type ColumnCodecSpec } from '@chkit/core';

import { required } from '../config.js';

const name = 'siri_vehicle_location';
const recordedTimeCodec: ColumnCodecSpec = [
  { kind: 'Delta', size: 4 },
  { kind: 'ZSTD', level: 1 },
];
const columns = [
  { name: 'siri_snapshot_id', type: 'String' },
  { name: 'recorded_at_time', type: 'DateTime', codec: recordedTimeCodec },
  { name: 'line_ref', type: 'String' },
  { name: 'data_frame_ref', type: 'LowCardinality(String)' },
  { name: 'dated_vehicle_journey_ref', type: 'String' },
  { name: 'operator_ref', type: 'LowCardinality(String)' },
  { name: 'origin_aimed_departure_time', type: 'DateTime' },
  { name: 'vehicle_location_longitude', type: 'String' },
  { name: 'vehicle_location_latitude', type: 'String' },
  { name: 'bearing', type: 'String' },
  { name: 'velocity', type: 'String' },
  { name: 'vehicle_ref', type: 'String' },
  { name: 'stop_point_ref', type: 'String' },
  { name: 'stop_order', type: 'LowCardinality(String)' },
  { name: 'distance_from_stop', type: 'String' },
  {
    name: 'journey_ref',
    type: 'String',
    defaultKind: 'ALIAS',
    default: { expression: "concat(data_frame_ref, '-', dated_vehicle_journey_ref)" },
  },
  {
    name: 'id',
    type: 'String',
    defaultKind: 'ALIAS',
    default: {
      expression: "concat(replaceOne(toString(recorded_at_time), ' ', ';'), ';', line_ref, ';', operator_ref, ';', journey_ref, ';', vehicle_ref)",
    },
  },
  { name: 'siri_route_id', type: 'String', defaultKind: 'ALIAS', default: { expression: "concat(line_ref, ';', operator_ref)" } },
  { name: 'scheduled_start_time', type: 'DateTime', defaultKind: 'ALIAS', default: { expression: 'origin_aimed_departure_time' } },
  { name: 'siri_ride_id', type: 'String', defaultKind: 'ALIAS', default: { expression: "concat(siri_route_id, ';', journey_ref)" } },
  { name: 'stop_code', type: 'String', defaultKind: 'ALIAS', default: { expression: 'stop_point_ref' } },
  { name: 'siri_stop_id', type: 'String', defaultKind: 'ALIAS', default: { expression: 'stop_code' } },
  {
    name: 'siri_ride_stop_id',
    type: 'String',
    defaultKind: 'ALIAS',
    default: { expression: "concat(siri_ride_id, ';', siri_stop_id, ';', stop_order)" },
  },
] as const;

const definition = table({
  database: required('CLICKHOUSE_DB'),
  name,
  comment: 'Raw SIRI vehicle observations partitioned by snapshot, with derived route, ride, stop, and observation identifiers.',
  columns: [...columns],
  engine: 'MergeTree',
  partitionBy:
    "format('{0}/{1}/{2}', splitByChar('/', siri_snapshot_id)[1], splitByChar('/', siri_snapshot_id)[2], splitByChar('/', siri_snapshot_id)[3])",
  primaryKey: ['recorded_at_time'],
  orderBy: ['recorded_at_time'],
  // chkit renders setting values as SQL, so string literals need SQL quotes.
  settings: { default_compression_codec: "'ZSTD(1)'" },
  indexes: [{ name: 'scheduled_start_time_idx', expression: 'scheduled_start_time', type: 'minmax', granularity: 1 }],
});

export default definition as typeof definition & { name: typeof name; columns: typeof columns };
