import { view } from '@chkit/core';

import { required } from '../config.js';

export default view({
  database: required('CLICKHOUSE_DB'),
  name: 'siri_ride',
  comment: 'SIRI rides aggregated from vehicle observations, with the latest observed duration and GTFS ride match.',
  as: `
select
    siri_vehicle_location.siri_ride_id as id,
    siri_route_id,
    journey_ref,
    scheduled_start_time,
    vehicle_ref,
    first_vehicle_location_id,
    last_vehicle_location_id,
    duration_minutes,
    gtfs_ride_id
-- Collapse observations and refresh history before joining to avoid row multiplication.
from (
    select
        siri_ride_id,
        any(siri_route_id) as siri_route_id,
        any(journey_ref) as journey_ref,
        any(scheduled_start_time) as scheduled_start_time,
        any(vehicle_ref) as vehicle_ref
    from siri_vehicle_location
    group by siri_ride_id
) AS siri_vehicle_location
left outer join (
    select
        siri_ride_id,
        argMax(first_vehicle_location_id, calculated_at) as first_vehicle_location_id,
        argMax(last_vehicle_location_id, calculated_at) as last_vehicle_location_id,
        argMax(duration_minutes, calculated_at) as duration_minutes
    from siri_ride_durations
    group by siri_ride_id
) AS siri_ride_durations
    on siri_ride_durations.siri_ride_id = siri_vehicle_location.siri_ride_id
left outer join (
    select
        siri_ride_id,
        argMax(gtfs_ride_id, calculated_at) as gtfs_ride_id
    from siri_ride_gtfs_ride
    group by siri_ride_id
) AS siri_ride_gtfs_ride
    on siri_ride_gtfs_ride.siri_ride_id = siri_vehicle_location.siri_ride_id
`,
});
