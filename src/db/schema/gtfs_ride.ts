import { gtfsTable } from '../models.js';

export default gtfsTable({
  name: 'gtfs_ride',
  comment: 'A planned ride along a route, populated daily from MOT GTFS data.',
  columns: [
    { name: 'id', type: 'Int32' },
    { name: 'gtfs_route_id', type: 'Nullable(Int32)', comment: 'Related gtfs_route.id.' },
    { name: 'journey_ref', type: 'Nullable(String)' },
    { name: 'first_gtfs_ride_stop_id', type: 'Nullable(Int64)', comment: 'First gtfs_ride_stop.id, populated by ride aggregation.' },
    { name: 'last_gtfs_ride_stop_id', type: 'Nullable(Int64)', comment: 'Last gtfs_ride_stop.id, populated by ride aggregation.' },
    { name: 'start_time', type: "Nullable(DateTime64(6, 'UTC'))" },
    { name: 'end_time', type: "Nullable(DateTime64(6, 'UTC'))" },
  ],
});
