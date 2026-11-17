-- Durable staging. No destination rows are changed by this script.
CREATE TABLE {database:Identifier}.gtfs_ingest_active_trip
ENGINE = MergeTree ORDER BY trip_id AS
SELECT t.trip_id AS trip_id, t.route_id AS route_id
FROM {database:Identifier}.gtfs_ingest_raw_trips AS t
INNER JOIN {database:Identifier}.gtfs_ingest_raw_calendar AS c ON c.service_id = t.service_id
WHERE {day:Date32} BETWEEN
    toDate32(concat(substring(c.start_date,1,4),'-',substring(c.start_date,5,2),'-',substring(c.start_date,7,2))) AND
    toDate32(concat(substring(c.end_date,1,4),'-',substring(c.end_date,5,2),'-',substring(c.end_date,7,2)))
  AND [c.monday,c.tuesday,c.wednesday,c.thursday,c.friday,c.saturday,c.sunday][toDayOfWeek({day:Date32})] = '1'
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_route ENGINE = MergeTree ORDER BY id AS
SELECT toUInt64(greatest(ifNull((SELECT max(id) FROM {database:Identifier}.gtfs_route),0),0)) + row_number() OVER (ORDER BY r.route_id) AS id,
  {day:Date32} AS date, toInt32(r.route_id) AS line_ref, toInt32(r.agency_id) AS operator_ref,
  if(r.route_short_name = '', 'NaN', r.route_short_name) AS route_short_name,
  if(r.route_long_name = '', 'NaN', r.route_long_name) AS route_long_name,
  if(length(splitByChar('-',r.route_desc)) = 3, splitByChar('-',r.route_desc)[1], NULL) AS route_mkt,
  if(length(splitByChar('-',r.route_desc)) = 3, splitByChar('-',r.route_desc)[2], NULL) AS route_direction,
  if(length(splitByChar('-',r.route_desc)) = 3, splitByChar('-',r.route_desc)[3], NULL) AS route_alternative,
  a.agency_name AS agency_name, r.route_type AS route_type
FROM {database:Identifier}.gtfs_ingest_raw_routes AS r
LEFT JOIN {database:Identifier}.gtfs_ingest_raw_agency AS a ON a.agency_id = r.agency_id
WHERE r.route_id IN (SELECT route_id FROM {database:Identifier}.gtfs_ingest_active_trip)
-- next statement
-- stop_id remains available alongside the generated ID, avoiding joins on a
-- nonunique stop_code. Duplicate codes deliberately remain separate stops.
CREATE TABLE {database:Identifier}.gtfs_ingest_stop ENGINE = MergeTree ORDER BY id AS
SELECT toUInt64(greatest(ifNull((SELECT max(id) FROM {database:Identifier}.gtfs_stop),0),0)) + row_number() OVER (ORDER BY stop_id) AS id,
  stop_id, {day:Date32} AS date, toInt32(stop_code) AS code,
  toFloat64(stop_lat) AS lat, toFloat64(stop_lon) AS lon, stop_name AS name,
  nullIf(trim(BOTH ' ' FROM splitByString('רציף:',splitByString('עיר:',stop_desc)[2])[1]),'') AS city
FROM {database:Identifier}.gtfs_ingest_raw_stops
WHERE stop_id IN (SELECT stop_id FROM {database:Identifier}.gtfs_ingest_raw_stop_times
  WHERE trip_id IN (SELECT trip_id FROM {database:Identifier}.gtfs_ingest_active_trip))
-- next statement
-- First build wide IDs. Capacity is checked before casting to target types.
CREATE TABLE {database:Identifier}.gtfs_ingest_ride_stop ENGINE = MergeTree ORDER BY id AS
WITH
  splitByChar(':', st.arrival_time) AS arrival,
  splitByChar(':', st.departure_time) AS departure,
  toUInt32(arrival[1]) AS arrival_hour,
  toUInt32(departure[1]) AS departure_hour
SELECT toUInt64(greatest(ifNull((SELECT max(id) FROM {database:Identifier}.gtfs_ride_stop),0),0)) + row_number() OVER (ORDER BY st.trip_id,toInt32(st.stop_sequence)) AS id,
  st.trip_id AS trip_id, t.route_id AS route_id, m.id AS gtfs_stop_id,
  toDateTime64(concat(toString(addDays({day:Date32},intDiv(arrival_hour,24))),' ',
    leftPad(toString(arrival_hour % 24),2,'0'),':',arrival[2],':',arrival[3]),6,'Asia/Jerusalem') AS arrival_time,
  toDateTime64(concat(toString(addDays({day:Date32},intDiv(departure_hour,24))),' ',
    leftPad(toString(departure_hour % 24),2,'0'),':',departure[2],':',departure[3]),6,'Asia/Jerusalem') AS departure_time,
  toInt32(st.stop_sequence) AS stop_sequence, toInt32(st.pickup_type) AS pickup_type,
  toInt32(st.drop_off_type) AS drop_off_type,
  nullIf(toInt32(nullIf(st.shape_dist_traveled,'')),0) AS shape_dist_traveled
FROM {database:Identifier}.gtfs_ingest_raw_stop_times AS st
INNER JOIN {database:Identifier}.gtfs_ingest_active_trip AS t ON t.trip_id = st.trip_id
INNER JOIN {database:Identifier}.gtfs_ingest_stop AS m ON m.stop_id = st.stop_id
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_ride ENGINE = MergeTree ORDER BY id AS
SELECT toUInt64(greatest(ifNull((SELECT max(id) FROM {database:Identifier}.gtfs_ride),0),0)) + row_number() OVER (ORDER BY journey_ref) AS id,
  gtfs_route_id, journey_ref, first_gtfs_ride_stop_id, last_gtfs_ride_stop_id, start_time, end_time
FROM (
  SELECT rs.trip_id AS journey_ref, any(r.id) AS gtfs_route_id,
    argMin(rs.id,rs.stop_sequence) AS first_gtfs_ride_stop_id,
    argMax(rs.id,rs.stop_sequence) AS last_gtfs_ride_stop_id,
    argMin(rs.departure_time,rs.stop_sequence) AS start_time,
    argMax(rs.arrival_time,rs.stop_sequence) AS end_time
  FROM {database:Identifier}.gtfs_ingest_ride_stop AS rs
  INNER JOIN {database:Identifier}.gtfs_ingest_route AS r ON r.line_ref = toInt32(rs.route_id)
  GROUP BY rs.trip_id)
-- next statement
-- Resolve the ride FK before any destination table is touched. Rename the intermediate
-- table and materialize the final payload with both sets of preallocated IDs.
RENAME TABLE {database:Identifier}.gtfs_ingest_ride_stop TO {database:Identifier}.gtfs_ingest_ride_stop_parsed
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_ride_stop ENGINE = MergeTree ORDER BY id AS
SELECT rs.id AS id, rs.gtfs_stop_id AS gtfs_stop_id, rd.id AS gtfs_ride_id,
  rs.arrival_time AS arrival_time, rs.departure_time AS departure_time,
  rs.stop_sequence AS stop_sequence, rs.pickup_type AS pickup_type,
  rs.drop_off_type AS drop_off_type, rs.shape_dist_traveled AS shape_dist_traveled,
  rs.trip_id AS trip_id
FROM {database:Identifier}.gtfs_ingest_ride_stop_parsed AS rs
INNER JOIN {database:Identifier}.gtfs_ingest_ride AS rd ON rd.journey_ref = rs.trip_id
-- next statement
-- Validate cardinality and IDs before recording a recoverable prepared run.
SELECT throwIf(
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_active_trip) = 0 OR
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_active_trip) != (SELECT uniqExact(trip_id) FROM {database:Identifier}.gtfs_ingest_active_trip) OR
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_ride) != (SELECT count() FROM {database:Identifier}.gtfs_ingest_active_trip) OR
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_route) != (SELECT uniqExact(line_ref) FROM {database:Identifier}.gtfs_ingest_route) OR
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_stop) != (SELECT uniqExact(stop_id) FROM {database:Identifier}.gtfs_ingest_stop) OR
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_ride_stop) != (SELECT uniqExact(tuple(trip_id,stop_sequence)) FROM {database:Identifier}.gtfs_ingest_ride_stop) OR
  (SELECT count() FROM {database:Identifier}.gtfs_ingest_ride_stop) !=
    (SELECT count() FROM {database:Identifier}.gtfs_ingest_raw_stop_times WHERE trip_id IN (SELECT trip_id FROM {database:Identifier}.gtfs_ingest_active_trip)) OR
  (SELECT max(id) FROM {database:Identifier}.gtfs_ingest_route) > 2147483647 OR
  (SELECT max(id) FROM {database:Identifier}.gtfs_ingest_stop) > 2147483647 OR
  (SELECT max(id) FROM {database:Identifier}.gtfs_ingest_ride) > 2147483647 OR
  (SELECT max(id) FROM {database:Identifier}.gtfs_ingest_ride_stop) > 9223372036854775807,
  'Invalid GTFS references, duplicate keys, empty trips, or exhausted ID capacity')
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_old_route ENGINE = MergeTree ORDER BY id AS
SELECT id FROM {database:Identifier}.gtfs_route WHERE date = {day:Date32}
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_old_ride ENGINE = MergeTree ORDER BY id AS
SELECT id FROM {database:Identifier}.gtfs_ride WHERE gtfs_route_id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_old_route)
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_old_stop ENGINE = MergeTree ORDER BY id AS
SELECT id FROM {database:Identifier}.gtfs_stop WHERE date = {day:Date32}
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_siri_ride ENGINE = MergeTree ORDER BY siri_ride_id AS
SELECT DISTINCT siri_ride_id FROM {database:Identifier}.siri_vehicle_location
WHERE toDate32(scheduled_start_time) = {day:Date32}
  OR scheduled_start_time IN (SELECT start_time FROM {database:Identifier}.gtfs_ingest_ride)
UNION DISTINCT
SELECT siri_ride_id FROM {database:Identifier}.siri_ride_gtfs_ride
WHERE gtfs_ride_id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_old_ride)
-- next statement
CREATE TABLE {database:Identifier}.gtfs_ingest_siri_stop ENGINE = MergeTree ORDER BY siri_ride_stop_id AS
SELECT DISTINCT siri_ride_stop_id FROM {database:Identifier}.siri_vehicle_location
WHERE toDate32(scheduled_start_time) = {day:Date32}
  OR siri_ride_id IN (SELECT siri_ride_id FROM {database:Identifier}.gtfs_ingest_siri_ride)
UNION DISTINCT
SELECT siri_ride_stop_id FROM {database:Identifier}.siri_ride_stop_gtfs_stop
WHERE gtfs_stop_id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_old_stop)
