import { refreshableModel } from '../models.js';

export default refreshableModel({
  name: 'siri_ride_durations',
  comment: 'Observed first and last vehicle locations per SIRI ride, with duration calculated after six hours without observations.',
  columns: [
    { name: 'siri_ride_id', type: 'String' },
    { name: 'first_vehicle_location_id', type: 'String' },
    { name: 'last_vehicle_location_id', type: 'String' },
    { name: 'first_recorded_at_time', type: 'DateTime' },
    { name: 'last_recorded_at_time', type: 'DateTime' },
    { name: 'duration_minutes', type: 'Nullable(Int32)' },
    { name: 'calculated_at', type: 'DateTime' },
  ],
  orderBy: ['siri_ride_id'],
  as: `
SELECT
    siri_ride_id,
    argMin(id, tuple(recorded_at_time, id)) AS first_vehicle_location_id,
    argMax(id, tuple(recorded_at_time, id)) AS last_vehicle_location_id,
    min(recorded_at_time) AS first_recorded_at_time,
    max(recorded_at_time) AS last_recorded_at_time,
    if(
        first_recorded_at_time < last_recorded_at_time
        AND last_recorded_at_time < now() - INTERVAL 6 HOUR,
        toNullable(
            toInt32(
                round(
                    dateDiff(
                        'second',
                        first_recorded_at_time,
                        last_recorded_at_time
                    ) / 60.0
                )
            )
        ),
        NULL
    ) AS duration_minutes,
    now() AS calculated_at
FROM siri_vehicle_location AS siri_vehicle_location
WHERE recorded_at_time > now() - INTERVAL 10 DAY
        and scheduled_start_time > now() - INTERVAL 9 DAY
GROUP BY siri_ride_id
`,
});
