import { refreshableModel } from '../models.js';
import stopMatches from './siri_ride_stop_gtfs_stop.js';

export default refreshableModel({
  name: 'siri_vehicle_location_distance_from_gtfs_stop',
  comment: 'Distance in meters from each distinct SIRI ride-stop vehicle position to its matched GTFS stop.',
  columns: [
    { name: 'siri_ride_stop_id', type: 'String' },
    { name: 'vehicle_location_latitude', type: 'String' },
    { name: 'vehicle_location_longitude', type: 'String' },
    { name: 'distance_from_gtfs_stop_meters', type: 'Nullable(Float64)' },
    { name: 'calculated_at', type: 'DateTime' },
  ],
  orderBy: ['siri_ride_stop_id', 'vehicle_location_latitude', 'vehicle_location_longitude'],
  dependsOn: [stopMatches.refresh.name],
  as: `
SELECT
    -- Explicit aliases keep joined column names aligned with the refresh target table.
    positions.siri_ride_stop_id AS siri_ride_stop_id,
    positions.vehicle_location_latitude AS vehicle_location_latitude,
    positions.vehicle_location_longitude AS vehicle_location_longitude,
    round(geoDistance(positions.longitude, positions.latitude, gtfs.coordinates.2, gtfs.coordinates.1))
        AS distance_from_gtfs_stop_meters,
    now() AS calculated_at
FROM (
    -- Deduplicate positions before either join, and parse each coordinate once.
    SELECT siri_ride_stop_id, vehicle_location_latitude, vehicle_location_longitude,
           toFloat64OrNull(vehicle_location_latitude) AS latitude,
           toFloat64OrNull(vehicle_location_longitude) AS longitude
    FROM siri_vehicle_location
    PREWHERE recorded_at_time >= now() - INTERVAL 10 DAY
    WHERE latitude BETWEEN 29 AND 34 AND longitude BETWEEN 32 AND 36
    GROUP BY siri_ride_stop_id, vehicle_location_latitude, vehicle_location_longitude
) AS positions
INNER JOIN (
    SELECT siri_ride_stop_id, gtfs_stop_id
    FROM siri_ride_stop_gtfs_stop FINAL
    WHERE gtfs_stop_id IS NOT NULL
) AS matches ON matches.siri_ride_stop_id = positions.siri_ride_stop_id
INNER JOIN (
    SELECT id, min(tuple(assumeNotNull(lat), assumeNotNull(lon))) AS coordinates
    FROM gtfs_stop
    WHERE date >= today() - INTERVAL 9 DAY
      AND lat BETWEEN 29 AND 34 AND lon BETWEEN 32 AND 36
    GROUP BY id
) AS gtfs ON gtfs.id = matches.gtfs_stop_id
`,
});
