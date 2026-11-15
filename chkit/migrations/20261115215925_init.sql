-- chkit-migration-format: v1
-- generated-at: 2026-11-15T21:59:25.680Z
-- cli-version: 0.2.0-beta.16
-- definition-count: 14
-- operation-count: 15
-- rename-suggestion-count: 0
-- risk-summary: safe=15, caution=0, danger=0

-- operation: create_database key=database:default risk=safe
CREATE DATABASE IF NOT EXISTS default;

-- operation: create_table key=table:default.gtfs_ride risk=safe
CREATE TABLE IF NOT EXISTS default.gtfs_ride
(
  `id` Int32,
  `gtfs_route_id` Nullable(Int32) COMMENT 'Related gtfs_route.id.',
  `journey_ref` Nullable(String),
  `first_gtfs_ride_stop_id` Nullable(Int64) COMMENT 'First gtfs_ride_stop.id, populated by ride aggregation.',
  `last_gtfs_ride_stop_id` Nullable(Int64) COMMENT 'Last gtfs_ride_stop.id, populated by ride aggregation.',
  `start_time` Nullable(DateTime64(6, 'UTC')),
  `end_time` Nullable(DateTime64(6, 'UTC'))
) ENGINE = MergeTree()
PRIMARY KEY (`id`)
ORDER BY (`id`)
SETTINGS index_granularity = 8192
COMMENT 'A planned ride along a route, populated daily from MOT GTFS data.';

-- operation: create_table key=table:default.gtfs_ride_stop risk=safe
CREATE TABLE IF NOT EXISTS default.gtfs_ride_stop
(
  `id` Int64,
  `gtfs_stop_id` Nullable(Int32) COMMENT 'Related gtfs_stop.id.',
  `gtfs_ride_id` Nullable(Int32) COMMENT 'Related gtfs_ride.id.',
  `arrival_time` Nullable(DateTime64(6, 'UTC')),
  `departure_time` Nullable(DateTime64(6, 'UTC')),
  `stop_sequence` Nullable(Int32),
  `pickup_type` Nullable(Int32),
  `drop_off_type` Nullable(Int32),
  `shape_dist_traveled` Nullable(Int32)
) ENGINE = MergeTree()
PRIMARY KEY (`id`)
ORDER BY (`id`)
SETTINGS index_granularity = 8192
COMMENT 'A planned stop along a GTFS ride, populated daily from MOT GTFS data.';

-- operation: create_table key=table:default.gtfs_route risk=safe
CREATE TABLE IF NOT EXISTS default.gtfs_route
(
  `id` Int32,
  `date` Nullable(Date32),
  `line_ref` Nullable(Int32),
  `operator_ref` Nullable(Int32),
  `route_short_name` Nullable(String),
  `route_long_name` Nullable(String),
  `route_mkt` Nullable(String),
  `route_direction` Nullable(String),
  `route_alternative` Nullable(String),
  `agency_name` Nullable(String),
  `route_type` Nullable(String)
) ENGINE = MergeTree()
PRIMARY KEY (`id`)
ORDER BY (`id`)
SETTINGS index_granularity = 8192
COMMENT 'A planned route, relevant for the specified date and populated daily from MOT GTFS data.';

-- operation: create_table key=table:default.gtfs_stop risk=safe
CREATE TABLE IF NOT EXISTS default.gtfs_stop
(
  `id` Int32,
  `date` Nullable(Date32),
  `code` Nullable(Int32),
  `lat` Nullable(Float64),
  `lon` Nullable(Float64),
  `name` Nullable(String),
  `city` Nullable(String)
) ENGINE = MergeTree()
PRIMARY KEY (`id`)
ORDER BY (`id`)
SETTINGS index_granularity = 8192
COMMENT 'A stop, relevant for the specified date and populated daily from MOT GTFS data.';

-- operation: create_table key=table:default.siri_ride_durations risk=safe
CREATE TABLE IF NOT EXISTS default.siri_ride_durations
(
  `siri_ride_id` String,
  `first_vehicle_location_id` String,
  `last_vehicle_location_id` String,
  `first_recorded_at_time` DateTime,
  `last_recorded_at_time` DateTime,
  `duration_minutes` Nullable(Int32),
  `calculated_at` DateTime
) ENGINE = ReplacingMergeTree(calculated_at)
PRIMARY KEY (`siri_ride_id`)
ORDER BY (`siri_ride_id`)
SETTINGS index_granularity = 8192
COMMENT 'Observed first and last vehicle locations per SIRI ride, with duration calculated after six hours without observations.';

-- operation: create_table key=table:default.siri_ride_gtfs_ride risk=safe
CREATE TABLE IF NOT EXISTS default.siri_ride_gtfs_ride
(
  `siri_ride_id` String,
  `gtfs_ride_id` Nullable(Int32),
  `calculated_at` DateTime
) ENGINE = ReplacingMergeTree(calculated_at)
PRIMARY KEY (`siri_ride_id`)
ORDER BY (`siri_ride_id`)
SETTINGS index_granularity = 8192
COMMENT 'Matches SIRI rides to GTFS rides by scheduled start time, line, and operator; ambiguous matches remain null.';

-- operation: create_table key=table:default.siri_ride_stop_gtfs_stop risk=safe
CREATE TABLE IF NOT EXISTS default.siri_ride_stop_gtfs_stop
(
  `siri_ride_stop_id` String,
  `gtfs_stop_id` Nullable(Int32),
  `calculated_at` DateTime
) ENGINE = ReplacingMergeTree(calculated_at)
PRIMARY KEY (`siri_ride_stop_id`)
ORDER BY (`siri_ride_stop_id`)
SETTINGS index_granularity = 8192
COMMENT 'Matches SIRI ride stops to GTFS stops by service date and stop code; ambiguous matches remain null.';

-- operation: create_table key=table:default.siri_vehicle_location risk=safe
CREATE TABLE IF NOT EXISTS default.siri_vehicle_location
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
PARTITION BY format('{0}/{1}', splitByChar('/', siri_snapshot_id)[1], splitByChar('/', siri_snapshot_id)[2])
PRIMARY KEY (`recorded_at_time`)
ORDER BY (`recorded_at_time`)
SETTINGS default_compression_codec = 'ZSTD(1)', index_granularity = 8192
COMMENT 'Raw SIRI vehicle observations partitioned by snapshot, with derived route, ride, stop, and observation identifiers.';

-- operation: create_table key=table:default.siri_vehicle_location_distance_from_gtfs_stop risk=safe
CREATE TABLE IF NOT EXISTS default.siri_vehicle_location_distance_from_gtfs_stop
(
  `siri_ride_stop_id` String,
  `vehicle_location_latitude` String,
  `vehicle_location_longitude` String,
  `distance_from_gtfs_stop_meters` Nullable(Float64),
  `calculated_at` DateTime
) ENGINE = ReplacingMergeTree(calculated_at)
PRIMARY KEY (`siri_ride_stop_id`, `vehicle_location_latitude`, `vehicle_location_longitude`)
ORDER BY (`siri_ride_stop_id`, `vehicle_location_latitude`, `vehicle_location_longitude`)
SETTINGS index_granularity = 8192
COMMENT 'Distance in meters from each distinct SIRI ride-stop vehicle position to its matched GTFS stop.';

-- operation: create_view key=view:default.siri_ride risk=safe
CREATE VIEW IF NOT EXISTS default.siri_ride COMMENT 'SIRI rides aggregated from vehicle observations, with the latest observed duration and GTFS ride match.' AS
select siri_vehicle_location.siri_ride_id as id, siri_route_id, journey_ref, scheduled_start_time, vehicle_ref, first_vehicle_location_id, last_vehicle_location_id, duration_minutes, gtfs_ride_id from ( select siri_ride_id, any(siri_route_id) as siri_route_id, any(journey_ref) as journey_ref, any(scheduled_start_time) as scheduled_start_time, any(vehicle_ref) as vehicle_ref from siri_vehicle_location group by siri_ride_id ) AS siri_vehicle_location left outer join ( select siri_ride_id, argMax(first_vehicle_location_id, calculated_at) as first_vehicle_location_id, argMax(last_vehicle_location_id, calculated_at) as last_vehicle_location_id, argMax(duration_minutes, calculated_at) as duration_minutes from siri_ride_durations group by siri_ride_id ) AS siri_ride_durations on siri_ride_durations.siri_ride_id = siri_vehicle_location.siri_ride_id left outer join ( select siri_ride_id, argMax(gtfs_ride_id, calculated_at) as gtfs_ride_id from siri_ride_gtfs_ride group by siri_ride_id ) AS siri_ride_gtfs_ride on siri_ride_gtfs_ride.siri_ride_id = siri_vehicle_location.siri_ride_id;

-- operation: create_materialized_view key=materialized_view:default.siri_ride_durations_refresh risk=safe
CREATE MATERIALIZED VIEW IF NOT EXISTS default.siri_ride_durations_refresh
REFRESH EVERY 10 MINUTE APPEND TO default.siri_ride_durations COMMENT 'Appends recalculated rows to siri_ride_durations every 10 minutes.' AS
SELECT siri_ride_id, argMin(id, tuple(recorded_at_time, id)) AS first_vehicle_location_id, argMax(id, tuple(recorded_at_time, id)) AS last_vehicle_location_id, min(recorded_at_time) AS first_recorded_at_time, max(recorded_at_time) AS last_recorded_at_time, if( first_recorded_at_time < last_recorded_at_time AND last_recorded_at_time < now() - INTERVAL 6 HOUR, toNullable( toInt32( round( dateDiff( 'second', first_recorded_at_time, last_recorded_at_time ) / 60.0 ) ) ), NULL ) AS duration_minutes, now() AS calculated_at FROM siri_vehicle_location AS siri_vehicle_location WHERE recorded_at_time > now() - INTERVAL 10 DAY and scheduled_start_time > now() - INTERVAL 9 DAY GROUP BY siri_ride_id;

-- operation: create_materialized_view key=materialized_view:default.siri_ride_gtfs_ride_refresh risk=safe
CREATE MATERIALIZED VIEW IF NOT EXISTS default.siri_ride_gtfs_ride_refresh
REFRESH EVERY 10 MINUTE APPEND TO default.siri_ride_gtfs_ride COMMENT 'Appends recalculated rows to siri_ride_gtfs_ride every 10 minutes.' AS
select siri_ride_id, if(min(gtfs.gtfs_ride_id) = max(gtfs.gtfs_ride_id), min(gtfs.gtfs_ride_id), NULL) as gtfs_ride_id, now() as calculated_at from ( select gtfs_ride.id gtfs_ride_id, gtfs_ride.start_time, gtfs_route.line_ref, gtfs_route.operator_ref from gtfs_ride AS gtfs_ride inner join gtfs_route AS gtfs_route on gtfs_route.id = gtfs_ride.gtfs_route_id where gtfs_route.date >= today() - INTERVAL 9 DAY ) as gtfs inner join ( select siri_ride_id, any(line_ref) as line_ref, any(operator_ref) as operator_ref, any(scheduled_start_time) as scheduled_start_time from siri_vehicle_location where recorded_at_time >= now() - INTERVAL 10 DAY group by siri_ride_id ) siri on gtfs.start_time = siri.scheduled_start_time and toString(gtfs.line_ref) = siri.line_ref and toString(gtfs.operator_ref) = siri.operator_ref group by siri_ride_id;

-- operation: create_materialized_view key=materialized_view:default.siri_ride_stop_gtfs_stop_refresh risk=safe
CREATE MATERIALIZED VIEW IF NOT EXISTS default.siri_ride_stop_gtfs_stop_refresh
REFRESH EVERY 10 MINUTE APPEND TO default.siri_ride_stop_gtfs_stop COMMENT 'Appends recalculated rows to siri_ride_stop_gtfs_stop every 10 minutes.' AS
select siri_ride_stop_id, gtfs.gtfs_stop_id as gtfs_stop_id, now() as calculated_at from ( select date as stop_day, toString(code) as stop_code, if(min(id) = max(id), min(id), NULL) as gtfs_stop_id from gtfs_stop AS gtfs_stop where gtfs_stop.date >= today() - INTERVAL 9 DAY group by stop_day, stop_code ) as gtfs inner join ( select siri_ride_stop_id, any(stop_code) as stop_code, any(scheduled_start_time) as scheduled_start_time from siri_vehicle_location AS siri_vehicle_location where recorded_at_time >= now() - INTERVAL 10 DAY group by siri_ride_stop_id ) siri on gtfs.stop_day = toDate32(siri.scheduled_start_time) and gtfs.stop_code = siri.stop_code;

-- operation: create_materialized_view key=materialized_view:default.siri_vehicle_location_distance_from_gtfs_stop_refresh risk=safe
CREATE MATERIALIZED VIEW IF NOT EXISTS default.siri_vehicle_location_distance_from_gtfs_stop_refresh
REFRESH EVERY 10 MINUTE DEPENDS ON default.siri_ride_stop_gtfs_stop_refresh APPEND TO default.siri_vehicle_location_distance_from_gtfs_stop COMMENT 'Appends recalculated rows to siri_vehicle_location_distance_from_gtfs_stop every 10 minutes.' AS
SELECT positions.siri_ride_stop_id AS siri_ride_stop_id, positions.vehicle_location_latitude AS vehicle_location_latitude, positions.vehicle_location_longitude AS vehicle_location_longitude, round(geoDistance(positions.longitude, positions.latitude, gtfs.coordinates.2, gtfs.coordinates.1)) AS distance_from_gtfs_stop_meters, now() AS calculated_at FROM ( SELECT siri_ride_stop_id, vehicle_location_latitude, vehicle_location_longitude, toFloat64OrNull(vehicle_location_latitude) AS latitude, toFloat64OrNull(vehicle_location_longitude) AS longitude FROM siri_vehicle_location PREWHERE recorded_at_time >= now() - INTERVAL 10 DAY WHERE latitude BETWEEN 29 AND 34 AND longitude BETWEEN 32 AND 36 GROUP BY siri_ride_stop_id, vehicle_location_latitude, vehicle_location_longitude ) AS positions INNER JOIN ( SELECT siri_ride_stop_id, gtfs_stop_id FROM siri_ride_stop_gtfs_stop FINAL WHERE gtfs_stop_id IS NOT NULL ) AS matches ON matches.siri_ride_stop_id = positions.siri_ride_stop_id INNER JOIN ( SELECT id, min(tuple(assumeNotNull(lat), assumeNotNull(lon))) AS coordinates FROM gtfs_stop WHERE date >= today() - INTERVAL 9 DAY AND lat BETWEEN 29 AND 34 AND lon BETWEEN 32 AND 36 GROUP BY id ) AS gtfs ON gtfs.id = matches.gtfs_stop_id;
