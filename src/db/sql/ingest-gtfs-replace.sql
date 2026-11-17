-- The client sets mutations_sync=2. Persisted old and staged IDs make every
-- deletion repeatable, including after a partially committed INSERT.
ALTER TABLE {database:Identifier}.siri_vehicle_location_distance_from_gtfs_stop DELETE
WHERE siri_ride_stop_id IN (SELECT siri_ride_stop_id FROM {database:Identifier}.gtfs_ingest_siri_stop)
-- next statement
ALTER TABLE {database:Identifier}.siri_ride_stop_gtfs_stop DELETE
WHERE siri_ride_stop_id IN (SELECT siri_ride_stop_id FROM {database:Identifier}.gtfs_ingest_siri_stop)
-- next statement
ALTER TABLE {database:Identifier}.siri_ride_gtfs_ride DELETE
WHERE siri_ride_id IN (SELECT siri_ride_id FROM {database:Identifier}.gtfs_ingest_siri_ride)
-- next statement
ALTER TABLE {database:Identifier}.gtfs_ride_stop DELETE WHERE
  gtfs_ride_id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_old_ride) OR
  id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_ride_stop)
-- next statement
ALTER TABLE {database:Identifier}.gtfs_ride DELETE WHERE
  id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_old_ride) OR
  id IN (SELECT id FROM {database:Identifier}.gtfs_ingest_ride)
-- next statement
ALTER TABLE {database:Identifier}.gtfs_route DELETE WHERE date = {day:Date32}
-- next statement
ALTER TABLE {database:Identifier}.gtfs_stop DELETE WHERE date = {day:Date32}
