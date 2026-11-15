import { gtfsTable } from '../models.js';

export default gtfsTable({
  name: 'gtfs_ride_stop',
  comment: 'A planned stop along a GTFS ride, populated daily from MOT GTFS data.',
  columns: [
    { name: 'id', type: 'Int64' },
    { name: 'gtfs_stop_id', type: 'Nullable(Int32)', comment: 'Related gtfs_stop.id.' },
    { name: 'gtfs_ride_id', type: 'Nullable(Int32)', comment: 'Related gtfs_ride.id.' },
    { name: 'arrival_time', type: "Nullable(DateTime64(6, 'UTC'))" },
    { name: 'departure_time', type: "Nullable(DateTime64(6, 'UTC'))" },
    { name: 'stop_sequence', type: 'Nullable(Int32)' },
    { name: 'pickup_type', type: 'Nullable(Int32)' },
    { name: 'drop_off_type', type: 'Nullable(Int32)' },
    { name: 'shape_dist_traveled', type: 'Nullable(Int32)' },
  ],
});
