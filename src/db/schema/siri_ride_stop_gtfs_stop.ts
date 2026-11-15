import { refreshableModel } from '../models.js';

export default refreshableModel({
  name: 'siri_ride_stop_gtfs_stop',
  comment: 'Matches SIRI ride stops to GTFS stops by service date and stop code; ambiguous matches remain null.',
  columns: [
    { name: 'siri_ride_stop_id', type: 'String' },
    { name: 'gtfs_stop_id', type: 'Nullable(Int32)' },
    { name: 'calculated_at', type: 'DateTime' },
  ],
  orderBy: ['siri_ride_stop_id'],
  as: `
select
    siri_ride_stop_id,
    -- Keep ambiguous codes unresolved instead of choosing an arbitrary platform.
    gtfs.gtfs_stop_id as gtfs_stop_id,
    now() as calculated_at
from (
        select
            date as stop_day,
            toString(code) as stop_code,
            -- Equal extrema mean one distinct ID, even when that ID is repeated.
            if(min(id) = max(id), min(id), NULL) as gtfs_stop_id
        from gtfs_stop AS gtfs_stop
        where gtfs_stop.date >= today() - INTERVAL 9 DAY
        group by stop_day, stop_code
) as gtfs
inner join (
    select
        siri_ride_stop_id,
        any(stop_code) as stop_code,
        any(scheduled_start_time) as scheduled_start_time
    from siri_vehicle_location AS siri_vehicle_location
    where recorded_at_time >= now() - INTERVAL 10 DAY
    group by siri_ride_stop_id
) siri
    on gtfs.stop_day = toDate32(siri.scheduled_start_time)
    and gtfs.stop_code = siri.stop_code
`,
});
