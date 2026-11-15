import { gtfsTable } from '../models.js';

export default gtfsTable({
  name: 'gtfs_route',
  comment: 'A planned route, relevant for the specified date and populated daily from MOT GTFS data.',
  columns: [
    { name: 'id', type: 'Int32' },
    { name: 'date', type: 'Nullable(Date32)' },
    { name: 'line_ref', type: 'Nullable(Int32)' },
    { name: 'operator_ref', type: 'Nullable(Int32)' },
    { name: 'route_short_name', type: 'Nullable(String)' },
    { name: 'route_long_name', type: 'Nullable(String)' },
    { name: 'route_mkt', type: 'Nullable(String)' },
    { name: 'route_direction', type: 'Nullable(String)' },
    { name: 'route_alternative', type: 'Nullable(String)' },
    { name: 'agency_name', type: 'Nullable(String)' },
    { name: 'route_type', type: 'Nullable(String)' },
  ],
});
