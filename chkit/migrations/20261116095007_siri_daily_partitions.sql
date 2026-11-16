-- chkit-migration-format: v1
-- generated-at: 2026-11-16T09:50:07.086Z
-- cli-version: 0.2.0-beta.16
-- definition-count: 14
-- operation-count: 2
-- rename-suggestion-count: 0
-- risk-summary: safe=0, caution=1, danger=1

-- Hand-reviewed replacement for the generated destructive DROP/CREATE plan.
-- Stop ingestion and pause refreshable views during this maintenance operation.
-- Requires an Atomic database; retains the original table as rollback backup.
-- Before EXCHANGE, a failed copy can be dropped and rebuilt. After EXCHANGE,
-- do not rerun this migration: inspect the live table and retained backup first.
-- operation: create_table key=table:default.siri_vehicle_location_daily risk=caution
CREATE TABLE default.siri_vehicle_location_daily
(
  `siri_snapshot_id` String,
  `recorded_at_time` DateTime CODEC(Delta(4), ZSTD(1)),
  `line_ref` String,
  `data_frame_ref` LowCardinality(String),
  `dated_vehicle_journey_ref` String,
  `operator_ref` LowCardinality(String),
  `origin_aimed_departure_time` DateTime,
  `vehicle_location_longitude` String,
  `vehicle_location_latitude` String,
  `bearing` String,
  `velocity` String,
  `vehicle_ref` String,
  `stop_point_ref` String,
  `stop_order` LowCardinality(String),
  `distance_from_stop` String,
  `journey_ref` String ALIAS concat(data_frame_ref, '-', dated_vehicle_journey_ref),
  `id` String ALIAS concat(replaceOne(toString(recorded_at_time), ' ', ';'), ';', line_ref, ';', operator_ref, ';', journey_ref, ';', vehicle_ref),
  `siri_route_id` String ALIAS concat(line_ref, ';', operator_ref),
  `scheduled_start_time` DateTime ALIAS origin_aimed_departure_time,
  `siri_ride_id` String ALIAS concat(siri_route_id, ';', journey_ref),
  `stop_code` String ALIAS stop_point_ref,
  `siri_stop_id` String ALIAS stop_code,
  `siri_ride_stop_id` String ALIAS concat(siri_ride_id, ';', siri_stop_id, ';', stop_order),
  INDEX `scheduled_start_time_idx` (scheduled_start_time) TYPE minmax GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY format('{0}/{1}/{2}', splitByChar('/', siri_snapshot_id)[1], splitByChar('/', siri_snapshot_id)[2], splitByChar('/', siri_snapshot_id)[3])
PRIMARY KEY (`recorded_at_time`)
ORDER BY (`recorded_at_time`)
SETTINGS default_compression_codec = 'ZSTD(1)', index_granularity = 8192
COMMENT 'Raw SIRI vehicle observations partitioned by snapshot, with derived route, ride, stop, and observation identifiers.';

INSERT INTO default.siri_vehicle_location_daily SELECT * FROM default.siri_vehicle_location;
-- operation: exchange_tables key=table:default.siri_vehicle_location risk=danger
EXCHANGE TABLES default.siri_vehicle_location AND default.siri_vehicle_location_daily;
