import { gtfsTable } from '../models.js';

export default gtfsTable({
  name: 'gtfs_stop',
  comment: 'A stop, relevant for the specified date and populated daily from MOT GTFS data.',
  columns: [
    { name: 'id', type: 'Int32' },
    { name: 'date', type: 'Nullable(Date32)' },
    { name: 'code', type: 'Nullable(Int32)' },
    { name: 'lat', type: 'Nullable(Float64)' },
    { name: 'lon', type: 'Nullable(Float64)' },
    { name: 'name', type: 'Nullable(String)' },
    { name: 'city', type: 'Nullable(String)' },
  ],
});
