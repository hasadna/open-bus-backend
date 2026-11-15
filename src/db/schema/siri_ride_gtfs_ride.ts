import { refreshableModel } from '../models.js';

export default refreshableModel({
  name: 'siri_ride_gtfs_ride',
  comment: 'Matches SIRI rides to GTFS rides by scheduled start time, line, and operator; ambiguous matches remain null.',
  columns: [
    { name: 'siri_ride_id', type: 'String' },
    { name: 'gtfs_ride_id', type: 'Nullable(Int32)' },
    { name: 'calculated_at', type: 'DateTime' },
  ],
  orderBy: ['siri_ride_id'],
  as: `
select
    siri_ride_id,
    -- Do not let multiple GTFS candidates race in ReplacingMergeTree.
    if(min(gtfs.gtfs_ride_id) = max(gtfs.gtfs_ride_id), min(gtfs.gtfs_ride_id), NULL) as gtfs_ride_id,
    now() as calculated_at
from (
        select
            gtfs_ride.id gtfs_ride_id,
            gtfs_ride.start_time,
            gtfs_route.line_ref,
            gtfs_route.operator_ref
        from gtfs_ride AS gtfs_ride
        inner join gtfs_route AS gtfs_route
            on gtfs_route.id = gtfs_ride.gtfs_route_id
        where gtfs_route.date >= today() - INTERVAL 9 DAY
) as gtfs
inner join (
    select
        siri_ride_id, any(line_ref) as line_ref,
        any(operator_ref) as operator_ref,
        any(scheduled_start_time) as scheduled_start_time
    from siri_vehicle_location
    where recorded_at_time >= now() - INTERVAL 10 DAY
    group by siri_ride_id
) siri
    on gtfs.start_time = siri.scheduled_start_time
    and toString(gtfs.line_ref) = siri.line_ref
    and toString(gtfs.operator_ref) = siri.operator_ref
group by siri_ride_id
`,
});
