-- Rebuild affected identities without the scheduled refresh's recent-day
-- cutoff. The matching and ambiguity rules are the existing model rules.
INSERT INTO {database:Identifier}.siri_ride_gtfs_ride (siri_ride_id,gtfs_ride_id,calculated_at)
SELECT siri.siri_ride_id,
  if(min(r.id) = max(r.id),min(r.id),NULL) AS gtfs_ride_id, now() AS calculated_at
FROM (
  SELECT siri_ride_id, any(line_ref) AS line_ref, any(operator_ref) AS operator_ref,
    any(scheduled_start_time) AS scheduled_start_time
  FROM {database:Identifier}.siri_vehicle_location
  WHERE siri_ride_id IN (SELECT siri_ride_id FROM {database:Identifier}.gtfs_ingest_siri_ride)
  GROUP BY siri_ride_id
) AS siri
INNER JOIN {database:Identifier}.gtfs_route AS route
  ON toString(route.line_ref) = siri.line_ref AND toString(route.operator_ref) = siri.operator_ref
INNER JOIN {database:Identifier}.gtfs_ride AS r
  ON r.gtfs_route_id = route.id AND r.start_time = siri.scheduled_start_time
GROUP BY siri.siri_ride_id
-- next statement
INSERT INTO {database:Identifier}.siri_ride_stop_gtfs_stop (siri_ride_stop_id,gtfs_stop_id,calculated_at)
SELECT siri.siri_ride_stop_id, gtfs.gtfs_stop_id, now() AS calculated_at
FROM (
  SELECT siri_ride_stop_id, any(stop_code) AS stop_code, any(scheduled_start_time) AS scheduled_start_time
  FROM {database:Identifier}.siri_vehicle_location
  WHERE siri_ride_stop_id IN (SELECT siri_ride_stop_id FROM {database:Identifier}.gtfs_ingest_siri_stop)
  GROUP BY siri_ride_stop_id
) AS siri
INNER JOIN (
  SELECT date AS stop_day, toString(code) AS stop_code, if(min(id) = max(id),min(id),NULL) AS gtfs_stop_id
  FROM {database:Identifier}.gtfs_stop GROUP BY date,code
) AS gtfs ON gtfs.stop_day = toDate32(siri.scheduled_start_time) AND gtfs.stop_code = siri.stop_code
-- next statement
INSERT INTO {database:Identifier}.siri_vehicle_location_distance_from_gtfs_stop
  (siri_ride_stop_id,vehicle_location_latitude,vehicle_location_longitude,distance_from_gtfs_stop_meters,calculated_at)
SELECT positions.siri_ride_stop_id, positions.vehicle_location_latitude, positions.vehicle_location_longitude,
  round(geoDistance(positions.longitude,positions.latitude,gtfs.coordinates.2,gtfs.coordinates.1)), now()
FROM (
  SELECT siri_ride_stop_id,vehicle_location_latitude,vehicle_location_longitude,
    toFloat64OrNull(vehicle_location_latitude) AS latitude, toFloat64OrNull(vehicle_location_longitude) AS longitude
  FROM {database:Identifier}.siri_vehicle_location
  WHERE siri_ride_stop_id IN (SELECT siri_ride_stop_id FROM {database:Identifier}.gtfs_ingest_siri_stop)
    AND latitude BETWEEN 29 AND 34 AND longitude BETWEEN 32 AND 36
  GROUP BY siri_ride_stop_id,vehicle_location_latitude,vehicle_location_longitude
) AS positions
INNER JOIN (
  SELECT siri_ride_stop_id,gtfs_stop_id FROM {database:Identifier}.siri_ride_stop_gtfs_stop FINAL WHERE gtfs_stop_id IS NOT NULL
) AS matches ON matches.siri_ride_stop_id = positions.siri_ride_stop_id
INNER JOIN (
  SELECT id,min(tuple(assumeNotNull(lat),assumeNotNull(lon))) AS coordinates
  FROM {database:Identifier}.gtfs_stop WHERE lat BETWEEN 29 AND 34 AND lon BETWEEN 32 AND 36 GROUP BY id
) AS gtfs ON gtfs.id = matches.gtfs_stop_id
