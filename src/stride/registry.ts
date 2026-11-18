import type { CacheMark } from './cache.js';
import { requireBoundedArrivalWindow } from './sql.js';
import type { EndpointDef } from './sql.js';

export function createRegistry(DB: string) {
  /**
   * Field lists and filter names are taken from the live production OpenAPI spec,
   * so the contract is not transcribed by hand. The table, alias and join wiring
   * are the part the spec does not encode and are written out explicitly here —
   * a per-endpoint rule is easier to check against the upstream router than a
   * clever naming convention would be.
   */
  /** Where a ride's measured columns come from. See ingest/enrich.sql. */
  const MEASURED = ['first_vehicle_location_id', 'last_vehicle_location_id', 'duration_minutes'];

  /** Where a ride's GTFS match comes from. See enrich_gtfs_link_src. */
  const LINKS = ['journey_gtfs_ride_id', 'route_gtfs_ride_id', 'gtfs_ride_id'];

  const endpoints: EndpointDef[] = [
    {
      path: '/siri_routes/list',
      model: 'SiriRoute',
      table: `${DB}.siri_route`,
      alias: 'r',
      fields: ['id', 'line_ref', 'operator_ref'],
      filters: [
        { param: 'line_refs', column: 'r.line_ref', type: 'in' },
        { param: 'operator_refs', column: 'r.operator_ref', type: 'in' },
      ],
      orderByDefault: 'id asc',
      orderable: { id: 'r.id', line_ref: 'r.line_ref', operator_ref: 'r.operator_ref' },
    },
    {
      path: '/siri_stops/list',
      model: 'SiriStop',
      table: `${DB}.siri_stop`,
      alias: 's',
      fields: ['id', 'code'],
      filters: [{ param: 'codes', column: 's.code', type: 'in' }],
      orderByDefault: 'id asc',
      orderable: { id: 's.id', code: 's.code' },
    },
    {
      path: '/gtfs_stops/list',
      model: 'GtfsStop',
      table: `${DB}.gtfs_stop`,
      alias: 's',
      fields: ['id', 'date', 'code', 'lat', 'lon', 'name', 'city'],
      filters: [
        { param: 'date_from', column: 's.date', type: 'date_from' },
        { param: 'date_to', column: 's.date', type: 'date_to' },
        { param: 'code', column: 's.code', type: 'equals' },
        { param: 'city', column: 's.city', type: 'equals', text: true },
      ],
      orderable: { id: 's.id', date: 's.date', code: 's.code' },
    },
    {
      path: '/gtfs_routes/list',
      textOrder: ['route_short_name', 'route_long_name', 'route_mkt', 'route_direction', 'route_alternative', 'agency_name', 'route_type'],
      model: 'GtfsRoute',
      table: `${DB}.gtfs_route`,
      alias: 'r',
      fields: [
        'id',
        'date',
        'line_ref',
        'operator_ref',
        'route_short_name',
        'route_long_name',
        'route_mkt',
        'route_direction',
        'route_alternative',
        'agency_name',
        'route_type',
      ],
      filters: [
        { param: 'date_from', column: 'r.date', type: 'date_from' },
        { param: 'date_to', column: 'r.date', type: 'date_to' },
        { param: 'line_refs', column: 'r.line_ref', type: 'in' },
        { param: 'operator_refs', column: 'r.operator_ref', type: 'in' },
        { param: 'route_short_name', column: 'r.route_short_name', type: 'equals', text: true },
        {
          param: 'route_long_name_contains',
          column: 'r.route_long_name',
          type: 'contains',
          text: true,
        },
        { param: 'route_mkt', column: 'r.route_mkt', type: 'equals', text: true },
        { param: 'route_direction', column: 'r.route_direction', type: 'equals', text: true },
        { param: 'route_alternative', column: 'r.route_alternative', type: 'equals', text: true },
        { param: 'agency_name', column: 'r.agency_name', type: 'equals', text: true },
        { param: 'route_type', column: 'r.route_type', type: 'equals', text: true },
      ],
      orderByDefault: 'id asc',
      orderable: { id: 'r.id', date: 'r.date', line_ref: 'r.line_ref' },
    },
    {
      path: '/siri_snapshots/list',
      textOrder: ['snapshot_id', 'etl_status', 'error', 'created_by'],
      model: 'SiriSnapshot',
      table: `${DB}.siri_snapshot`,
      alias: 'sn',
      fields: [
        'id',
        'snapshot_id',
        'etl_status',
        'etl_start_time',
        'etl_end_time',
        'error',
        'num_successful_parse_vehicle_locations',
        'num_failed_parse_vehicle_locations',
        'num_added_siri_rides',
        'num_added_siri_ride_stops',
        'num_added_siri_routes',
        'num_added_siri_stops',
        'last_heartbeat',
        'created_by',
      ],
      filters: [{ param: 'snapshot_id_prefix', column: 'sn.snapshot_id', type: 'prefix', text: true }],
      orderByDefault: 'id asc',
      orderable: { id: 'sn.id', snapshot_id: 'sn.snapshot_id' },
    },
    {
      // The join chain and its INNER semantics mirror _post_session_query_hook in
      // open_bus_stride_api/routers/siri_vehicle_locations.py: rows whose
      // siri_ride_stop_id does not resolve are absent from the response.
      path: '/siri_vehicle_locations/list',
      model: 'SiriVehicleLocation',
      table: `${DB}.siri_vehicle_location`,
      alias: 'vl',
      fields: [
        'id',
        'siri_snapshot_id',
        'siri_ride_stop_id',
        'recorded_at_time',
        'lon',
        'lat',
        'bearing',
        'velocity',
        'distance_from_journey_start',
        'distance_from_siri_ride_stop_meters',
      ],
      joins: [
        `INNER JOIN ${DB}.siri_ride_stop AS rs ON rs.id = vl.siri_ride_stop_id`,
        `INNER JOIN ${DB}.siri_ride AS r ON r.id = rs.siri_ride_id`,
        `INNER JOIN ${DB}.siri_route AS rt ON rt.id = r.siri_route_id`,
        `INNER JOIN ${DB}.siri_snapshot AS sn ON sn.id = vl.siri_snapshot_id`,
        `LEFT JOIN ${DB}.siri_ride_gtfs AS lk ON lk.siri_ride_id = r.id`,
        // Last, for the join-order reason given on /siri_rides/list.
        `LEFT JOIN ${DB}.siri_ride_duration AS d ON d.siri_ride_id = r.id`,
      ],
      related: [
        { prefix: 'siri_snapshot__', alias: 'sn', fields: ['snapshot_id'] },
        { prefix: 'siri_route__', alias: 'rt', fields: ['id', 'line_ref', 'operator_ref'] },
        {
          prefix: 'siri_ride__',
          alias: 'r',
          fields: ['id', 'journey_ref', 'scheduled_start_time', 'vehicle_ref'],
        },
        { prefix: 'siri_ride__', alias: 'lk', fields: ['gtfs_ride_id'] },
        { prefix: 'siri_ride__', alias: 'd', fields: MEASURED },
      ],
      filters: [
        { param: 'siri_vehicle_location_ids', column: 'vl.id', type: 'in' },
        { param: 'siri_snapshot_ids', column: 'vl.siri_snapshot_id', type: 'in' },
        { param: 'siri_ride_stop_ids', column: 'vl.siri_ride_stop_id', type: 'in' },
        { param: 'recorded_at_time_from', column: 'vl.recorded_at_time', type: 'datetime_from' },
        { param: 'recorded_at_time_to', column: 'vl.recorded_at_time', type: 'datetime_to' },
        { param: 'lon__greater_or_equal', column: 'vl.lon', type: 'greater_or_equal' },
        { param: 'lon__lower_or_equal', column: 'vl.lon', type: 'lower_or_equal' },
        { param: 'lat__greater_or_equal', column: 'vl.lat', type: 'greater_or_equal' },
        { param: 'lat__lower_or_equal', column: 'vl.lat', type: 'lower_or_equal' },
        { param: 'siri_routes__line_ref', column: 'rt.line_ref', type: 'equals' },
        { param: 'siri_ride__vehicle_ref', column: 'r.vehicle_ref', type: 'equals', text: true },
        { param: 'siri_routes__operator_ref', column: 'rt.operator_ref', type: 'equals' },
        {
          param: 'siri_rides__ids',
          column: 'r.id',
          type: 'in',
          narrows: { column: 'vl.siri_ride_stop_id', table: `${DB}.siri_ride_stop`, key: 'siri_ride_id' },
        },
        { param: 'siri_routes__ids', column: 'rt.id', type: 'in' },
        // Misspelled variants are still served; dropping them would break callers.
        {
          param: 'siri_rides__schedualed_start_time_from',
          column: 'r.scheduled_start_time',
          type: 'datetime_from',
        },
        {
          param: 'siri_rides__schedualed_start_time_to',
          column: 'r.scheduled_start_time',
          type: 'datetime_to',
        },
        {
          param: 'siri_rides__scheduled_start_time_from',
          column: 'r.scheduled_start_time',
          type: 'datetime_from',
        },
        {
          param: 'siri_rides__scheduled_start_time_to',
          column: 'r.scheduled_start_time',
          type: 'datetime_to',
        },
      ],
      orderByDefault: 'id asc',
      orderable: {
        id: 'vl.id',
        recorded_at_time: 'vl.recorded_at_time',
        lon: 'vl.lon',
        lat: 'vl.lat',
        distance_from_siri_ride_stop_meters: 'vl.distance_from_siri_ride_stop_meters',
        distance_from_journey_start: 'vl.distance_from_journey_start',
      },
    },
    {
      path: '/siri_rides/list',
      textOrder: ['journey_ref', 'vehicle_ref'],
      model: 'SiriRide',
      table: `${DB}.siri_ride`,
      alias: 'r',
      // Only the first join is inner; a siri ride need not have been matched to a
      // GTFS ride, and the published schema marks every gtfs_* field nullable.
      //
      // siri_ride_duration carries what production keeps in siri_ride itself, for
      // the reason ingest/enrich.sql gives. Joined here rather than behind a view
      // over siri_ride: as a subquery the view stopped this filter from reaching
      // the base table and took the page over the 4 GiB ceiling, while the join
      // written here costs it nothing — 0.559 s without it, 0.530 s with.
      joins: [
        `INNER JOIN ${DB}.siri_route AS sr ON sr.id = r.siri_route_id`,
        `LEFT JOIN ${DB}.siri_ride_gtfs AS lk ON lk.siri_ride_id = r.id`,
        `LEFT JOIN ${DB}.gtfs_ride AS gr ON gr.id = lk.gtfs_ride_id`,
        `LEFT JOIN ${DB}.gtfs_route AS grt ON grt.id = gr.gtfs_route_id`,
        // Last on purpose. ClickHouse joins in the order written, and this one
        // placed before the gtfs joins took an hour's page from 0.530 s to
        // 18.729 s — same rows, same columns, 35x the time.
        `LEFT JOIN ${DB}.siri_ride_duration AS d ON d.siri_ride_id = r.id`,
      ],
      fields: [
        'id',
        'siri_route_id',
        'journey_ref',
        'scheduled_start_time',
        'vehicle_ref',
        'updated_first_last_vehicle_locations',
        'updated_duration_minutes',
      ],
      // `scheduled_time_gtfs_ride_id` is a column of siri_ride_gtfs but not of
      // the pydantic model, so it is absent from the response.
      related: [
        { prefix: '', alias: 'lk', fields: LINKS },
        { prefix: '', alias: 'd', fields: MEASURED },
        { prefix: 'siri_route__', alias: 'sr', fields: ['line_ref', 'operator_ref'] },
        {
          prefix: 'gtfs_ride__',
          alias: 'gr',
          fields: ['gtfs_route_id', 'journey_ref', 'start_time', 'end_time'],
        },
        {
          prefix: 'gtfs_route__',
          alias: 'grt',
          fields: [
            'date',
            'line_ref',
            'operator_ref',
            'route_short_name',
            'route_long_name',
            'route_mkt',
            'route_direction',
            'route_alternative',
            'agency_name',
            'route_type',
          ],
        },
      ],
      filters: [
        { param: 'gtfs_route__date_from', column: 'grt.date', type: 'date_from' },
        { param: 'gtfs_route__date_to', column: 'grt.date', type: 'date_to' },
        { param: 'gtfs_route__line_refs', column: 'grt.line_ref', type: 'in' },
        { param: 'gtfs_route__operator_refs', column: 'grt.operator_ref', type: 'in' },
        {
          param: 'gtfs_route__route_short_name',
          column: 'grt.route_short_name',
          type: 'equals',
          text: true,
        },
        {
          param: 'gtfs_route__route_long_name_contains',
          column: 'grt.route_long_name',
          type: 'contains',
        },
        { param: 'gtfs_route__route_mkt', column: 'grt.route_mkt', type: 'equals', text: true },
        {
          param: 'gtfs_route__route_direction',
          column: 'grt.route_direction',
          type: 'equals',
          text: true,
        },
        {
          param: 'gtfs_route__route_alternative',
          column: 'grt.route_alternative',
          type: 'equals',
          text: true,
        },
        { param: 'gtfs_route__agency_name', column: 'grt.agency_name', type: 'equals', text: true },
        { param: 'gtfs_route__route_type', column: 'grt.route_type', type: 'equals', text: true },
        { param: 'gtfs_ride__gtfs_route_id', column: 'gr.gtfs_route_id', type: 'equals' },
        { param: 'gtfs_ride__journey_ref_prefix', column: 'gr.journey_ref', type: 'prefix' },
        { param: 'gtfs_ride__start_time_from', column: 'gr.start_time', type: 'datetime_from' },
        // Not a typo: `start_time_to` filters end_time upstream, so a ride that
        // overlaps the window qualifies. Reproduced rather than corrected.
        { param: 'gtfs_ride__start_time_to', column: 'gr.end_time', type: 'datetime_to' },
        { param: 'siri_route_ids', column: 'r.siri_route_id', type: 'in' },
        { param: 'siri_route__line_refs', column: 'sr.line_ref', type: 'in' },
        { param: 'siri_route__operator_refs', column: 'sr.operator_ref', type: 'in' },
        { param: 'journey_ref_prefix', column: 'r.journey_ref', type: 'prefix' },
        { param: 'journey_refs', column: 'r.journey_ref', type: 'in', text: true },
        { param: 'vehicle_refs', column: 'r.vehicle_ref', type: 'in', text: true },
        {
          param: 'scheduled_start_time_from',
          column: 'r.scheduled_start_time',
          type: 'datetime_from',
        },
        { param: 'scheduled_start_time_to', column: 'r.scheduled_start_time', type: 'datetime_to' },
      ],
      orderByDefault: 'id asc',
      orderable: {
        id: 'r.id',
        siri_route_id: 'r.siri_route_id',
        journey_ref: 'r.journey_ref',
        scheduled_start_time: 'r.scheduled_start_time',
        vehicle_ref: 'r.vehicle_ref',
        duration_minutes: 'd.duration_minutes',
        gtfs_ride_id: 'lk.gtfs_ride_id',
      },
    },
    {
      path: '/gtfs_rides/list',
      textOrder: ['journey_ref'],
      model: 'GtfsRide',
      table: `${DB}.gtfs_ride`,
      alias: 'r',
      joins: [`INNER JOIN ${DB}.gtfs_route AS grt ON grt.id = r.gtfs_route_id`],
      fields: ['id', 'gtfs_route_id', 'journey_ref', 'start_time', 'end_time'],
      related: [
        {
          prefix: 'gtfs_route__',
          alias: 'grt',
          fields: [
            'date',
            'line_ref',
            'operator_ref',
            'route_short_name',
            'route_long_name',
            'route_mkt',
            'route_direction',
            'route_alternative',
            'agency_name',
            'route_type',
          ],
        },
      ],
      filters: [
        { param: 'gtfs_route_id', column: 'r.gtfs_route_id', type: 'equals' },
        { param: 'journey_ref_prefix', column: 'r.journey_ref', type: 'prefix' },
        { param: 'start_time_from', column: 'r.start_time', type: 'datetime_from' },
        // As in /siri_rides/list, the `_to` bound is applied to end_time.
        { param: 'start_time_to', column: 'r.end_time', type: 'datetime_to' },
        { param: 'gtfs_route__date_from', column: 'grt.date', type: 'date_from' },
        { param: 'gtfs_route__date_to', column: 'grt.date', type: 'date_to' },
        { param: 'gtfs_route__line_refs', column: 'grt.line_ref', type: 'in' },
        { param: 'gtfs_route__operator_refs', column: 'grt.operator_ref', type: 'in' },
        {
          param: 'gtfs_route__route_short_name',
          column: 'grt.route_short_name',
          type: 'equals',
          text: true,
        },
        {
          param: 'gtfs_route__route_long_name_contains',
          column: 'grt.route_long_name',
          type: 'contains',
        },
        { param: 'gtfs_route__route_mkt', column: 'grt.route_mkt', type: 'equals', text: true },
        {
          param: 'gtfs_route__route_direction',
          column: 'grt.route_direction',
          type: 'equals',
          text: true,
        },
        {
          param: 'gtfs_route__route_alternative',
          column: 'grt.route_alternative',
          type: 'equals',
          text: true,
        },
        { param: 'gtfs_route__agency_name', column: 'grt.agency_name', type: 'equals', text: true },
        { param: 'gtfs_route__route_type', column: 'grt.route_type', type: 'equals', text: true },
      ],
      orderByDefault: 'id asc',
      orderable: {
        id: 'r.id',
        gtfs_route_id: 'r.gtfs_route_id',
        journey_ref: 'r.journey_ref',
        start_time: 'r.start_time',
        end_time: 'r.end_time',
      },
    },
    {
      path: '/gtfs_ride_stops/list',
      model: 'GtfsRideStop',
      table: `${DB}.gtfs_ride_stop`,
      alias: 'rs',
      validate: requireBoundedArrivalWindow,
      joins: [
        `INNER JOIN ${DB}.gtfs_ride AS gr ON gr.id = rs.gtfs_ride_id`,
        `INNER JOIN ${DB}.gtfs_stop AS gs ON gs.id = rs.gtfs_stop_id`,
        `INNER JOIN ${DB}.gtfs_route AS grt ON grt.id = gr.gtfs_route_id`,
      ],
      fields: [
        'id',
        'gtfs_stop_id',
        'gtfs_ride_id',
        'arrival_time',
        'departure_time',
        'stop_sequence',
        'pickup_type',
        'drop_off_type',
        'shape_dist_traveled',
      ],
      related: [
        {
          prefix: 'gtfs_ride__',
          alias: 'gr',
          fields: ['gtfs_route_id', 'journey_ref', 'start_time', 'end_time'],
        },
        { prefix: 'gtfs_stop__', alias: 'gs', fields: ['date', 'code', 'lat', 'lon', 'name', 'city'] },
        {
          prefix: 'gtfs_route__',
          alias: 'grt',
          fields: [
            'date',
            'line_ref',
            'operator_ref',
            'route_short_name',
            'route_long_name',
            'route_mkt',
            'route_direction',
            'route_alternative',
            'agency_name',
            'route_type',
          ],
        },
      ],
      filters: [
        { param: 'arrival_time_from', column: 'rs.arrival_time', type: 'datetime_from' },
        { param: 'arrival_time_to', column: 'rs.arrival_time', type: 'datetime_to' },
        { param: 'gtfs_stop_ids', column: 'rs.gtfs_stop_id', type: 'in' },
        { param: 'gtfs_ride_ids', column: 'rs.gtfs_ride_id', type: 'in' },
        { param: 'gtfs_ride__gtfs_route_id', column: 'gr.gtfs_route_id', type: 'equals' },
        { param: 'gtfs_ride__journey_ref_prefix', column: 'gr.journey_ref', type: 'prefix' },
        { param: 'gtfs_ride__start_time_from', column: 'gr.start_time', type: 'datetime_from' },
        { param: 'gtfs_ride__start_time_to', column: 'gr.end_time', type: 'datetime_to' },
        { param: 'gtfs_stop__date_from', column: 'gs.date', type: 'date_from' },
        { param: 'gtfs_stop__date_to', column: 'gs.date', type: 'date_to' },
        { param: 'gtfs_stop__code', column: 'gs.code', type: 'equals' },
        { param: 'gtfs_stop__city', column: 'gs.city', type: 'equals', text: true },
        { param: 'gtfs_route__date_from', column: 'grt.date', type: 'date_from' },
        { param: 'gtfs_route__date_to', column: 'grt.date', type: 'date_to' },
        { param: 'gtfs_route__line_refs', column: 'grt.line_ref', type: 'in' },
        { param: 'gtfs_route__operator_refs', column: 'grt.operator_ref', type: 'in' },
        {
          param: 'gtfs_route__route_short_name',
          column: 'grt.route_short_name',
          type: 'equals',
          text: true,
        },
        {
          param: 'gtfs_route__route_long_name_contains',
          column: 'grt.route_long_name',
          type: 'contains',
        },
        { param: 'gtfs_route__route_mkt', column: 'grt.route_mkt', type: 'equals', text: true },
        {
          param: 'gtfs_route__route_direction',
          column: 'grt.route_direction',
          type: 'equals',
          text: true,
        },
        {
          param: 'gtfs_route__route_alternative',
          column: 'grt.route_alternative',
          type: 'equals',
          text: true,
        },
        { param: 'gtfs_route__agency_name', column: 'grt.agency_name', type: 'equals', text: true },
        { param: 'gtfs_route__route_type', column: 'grt.route_type', type: 'equals', text: true },
      ],
      orderByDefault: 'id asc',
      orderable: {
        id: 'rs.id',
        gtfs_stop_id: 'rs.gtfs_stop_id',
        gtfs_ride_id: 'rs.gtfs_ride_id',
        arrival_time: 'rs.arrival_time',
        departure_time: 'rs.departure_time',
        stop_sequence: 'rs.stop_sequence',
      },
    },
    {
      path: '/siri_ride_stops/list',
      model: 'SiriRideStop',
      table: `${DB}.siri_ride_stop`,
      alias: 'rs',
      // Join order is fixed by alias dependencies, not by taste: gtfs_ride_stop
      // is matched on both gtfs_stop and gtfs_ride, so both must already be in
      // scope, and gtfs_route hangs off gtfs_ride.
      // Every big right side is prefiltered to the ids the base filter can
      // produce; see `joins` in sql.ts. siri_stop is 36k rows and needs none.
      joins: [
        `INNER JOIN (SELECT * FROM ${DB}.siri_ride WHERE id IN (
          SELECT siri_ride_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
        )) AS sr ON sr.id = rs.siri_ride_id`,
        `INNER JOIN ${DB}.siri_stop AS ss ON ss.id = rs.siri_stop_id`,
        `LEFT JOIN (SELECT * FROM ${DB}.gtfs_stop WHERE id IN (
          SELECT gtfs_stop_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
        )) AS gs ON gs.id = rs.gtfs_stop_id`,
        `LEFT JOIN (SELECT * FROM ${DB}.siri_vehicle_location WHERE id IN (
          SELECT nearest_siri_vehicle_location_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
        )) AS vl ON vl.id = rs.nearest_siri_vehicle_location_id`,
        `LEFT JOIN (SELECT * FROM ${DB}.siri_ride_gtfs WHERE siri_ride_id IN (
          SELECT siri_ride_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
        )) AS lk ON lk.siri_ride_id = rs.siri_ride_id`,
        `LEFT JOIN (SELECT * FROM ${DB}.gtfs_ride WHERE id IN (
          SELECT gtfs_ride_id FROM ${DB}.siri_ride_gtfs WHERE siri_ride_id IN (
            SELECT siri_ride_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
          )
        )) AS gr ON gr.id = lk.gtfs_ride_id`,
        `LEFT JOIN (SELECT * FROM ${DB}.gtfs_ride_stop WHERE gtfs_stop_id IN (
          SELECT gtfs_stop_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
        )) AS grs ON grs.gtfs_stop_id = gs.id AND grs.gtfs_ride_id = gr.id`,
        `LEFT JOIN (SELECT * FROM ${DB}.gtfs_route WHERE id IN (
          SELECT gtfs_route_id FROM ${DB}.gtfs_ride WHERE id IN (
            SELECT gtfs_ride_id FROM ${DB}.siri_ride_gtfs WHERE siri_ride_id IN (
              SELECT siri_ride_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
            )
          )
        )) AS grt ON grt.id = gr.gtfs_route_id`,
        // Last, for the join-order reason given on /siri_rides/list.
        `LEFT JOIN (SELECT * FROM ${DB}.siri_ride_duration WHERE siri_ride_id IN (
          SELECT siri_ride_id FROM ${DB}.siri_ride_stop WHERE __BASE_WHERE__
        )) AS d ON d.siri_ride_id = rs.siri_ride_id`,
      ],
      fields: ['id', 'siri_stop_id', 'siri_ride_id', 'order', 'gtfs_stop_id', 'nearest_siri_vehicle_location_id'],
      related: [
        { prefix: 'siri_stop__', alias: 'ss', fields: ['code'] },
        {
          prefix: 'siri_ride__',
          alias: 'sr',
          fields: [
            'siri_route_id',
            'journey_ref',
            'scheduled_start_time',
            'vehicle_ref',
            'updated_first_last_vehicle_locations',
            'updated_duration_minutes',
          ],
        },
        { prefix: 'siri_ride__', alias: 'lk', fields: LINKS },
        { prefix: 'siri_ride__', alias: 'd', fields: MEASURED },
        { prefix: 'gtfs_stop__', alias: 'gs', fields: ['date', 'code', 'lat', 'lon', 'name', 'city'] },
        {
          prefix: 'nearest_siri_vehicle_location__',
          alias: 'vl',
          fields: [
            'siri_snapshot_id',
            'siri_ride_stop_id',
            'recorded_at_time',
            'lon',
            'lat',
            'bearing',
            'velocity',
            'distance_from_journey_start',
            'distance_from_siri_ride_stop_meters',
          ],
        },
        {
          prefix: 'gtfs_ride_stop__',
          alias: 'grs',
          fields: [
            'gtfs_stop_id',
            'gtfs_ride_id',
            'arrival_time',
            'departure_time',
            'stop_sequence',
            'pickup_type',
            'drop_off_type',
            'shape_dist_traveled',
          ],
        },
        {
          prefix: 'gtfs_ride__',
          alias: 'gr',
          fields: ['gtfs_route_id', 'journey_ref', 'start_time', 'end_time'],
        },
        {
          prefix: 'gtfs_route__',
          alias: 'grt',
          fields: [
            'date',
            'line_ref',
            'operator_ref',
            'route_short_name',
            'route_long_name',
            'route_mkt',
            'route_direction',
            'route_alternative',
            'agency_name',
            'route_type',
          ],
        },
      ],
      filters: [
        { param: 'siri_stop_ids', column: 'rs.siri_stop_id', type: 'in' },
        { param: 'siri_ride_ids', column: 'rs.siri_ride_id', type: 'in' },
        {
          param: 'siri_vehicle_location__lon__greater_or_equal',
          column: 'vl.lon',
          type: 'greater_or_equal',
        },
        {
          param: 'siri_vehicle_location__lon__lower_or_equal',
          column: 'vl.lon',
          type: 'lower_or_equal',
        },
        {
          param: 'siri_vehicle_location__lat__greater_or_equal',
          column: 'vl.lat',
          type: 'greater_or_equal',
        },
        {
          param: 'siri_vehicle_location__lat__lower_or_equal',
          column: 'vl.lat',
          type: 'lower_or_equal',
        },
        {
          param: 'siri_vehicle_location__recorded_at_time_from',
          column: 'vl.recorded_at_time',
          type: 'datetime_from',
        },
        {
          param: 'siri_vehicle_location__recorded_at_time_to',
          column: 'vl.recorded_at_time',
          type: 'datetime_to',
        },
        { param: 'gtfs_stop__lat__greater_or_equal', column: 'gs.lat', type: 'greater_or_equal' },
        { param: 'gtfs_stop__lat__lower_or_equal', column: 'gs.lat', type: 'lower_or_equal' },
        { param: 'gtfs_stop__lon__greater_or_equal', column: 'gs.lon', type: 'greater_or_equal' },
        { param: 'gtfs_stop__lon__lower_or_equal', column: 'gs.lon', type: 'lower_or_equal' },
        // One parameter, two columns: upstream applies gtfs_date to the route's
        // date and the stop's date both, so it appears twice here.
        { param: 'gtfs_date_from', column: 'grt.date', type: 'date_from' },
        { param: 'gtfs_date_to', column: 'grt.date', type: 'date_to' },
        { param: 'gtfs_date_from', column: 'gs.date', type: 'date_from' },
        { param: 'gtfs_date_to', column: 'gs.date', type: 'date_to' },
        {
          param: 'siri_ride__scheduled_start_time_from',
          column: 'sr.scheduled_start_time',
          type: 'datetime_from',
        },
        {
          param: 'siri_ride__scheduled_start_time_to',
          column: 'sr.scheduled_start_time',
          type: 'datetime_to',
        },
      ],
      // The published default is empty, which falls through to the id tiebreaker.
      orderByDefault: '',
      orderable: {
        id: 'rs.id',
        siri_stop_id: 'rs.siri_stop_id',
        siri_ride_id: 'rs.siri_ride_id',
        order: 'rs.`order`',
        gtfs_stop_id: 'rs.gtfs_stop_id',
      },
    },
  ];

  /** `/<name>/get` endpoints: single row by id, same field list as the plain list. */
  const getEndpoints: (CacheMark & {
    path: string;
    table: string;
    fields: string[];
    /**
     * One row by id, so a join here is two primary-key lookups and needs none of
     * the restriction the list endpoints build. `alias` is required with `joins`,
     * because the columns then have to say which table they come from.
     */
    alias?: string;
    joins?: string[];
    related?: { alias: string; fields: string[] }[];
  })[] = [
    { path: '/siri_routes/get', table: `${DB}.siri_route`, fields: ['id', 'line_ref', 'operator_ref'] },
    { path: '/siri_stops/get', table: `${DB}.siri_stop`, fields: ['id', 'code'] },
    {
      path: '/gtfs_stops/get',
      table: `${DB}.gtfs_stop`,
      fields: ['id', 'date', 'code', 'lat', 'lon', 'name', 'city'],
    },
    {
      path: '/siri_vehicle_locations/get',
      table: `${DB}.siri_vehicle_location`,
      fields: [
        'id',
        'siri_snapshot_id',
        'siri_ride_stop_id',
        'recorded_at_time',
        'lon',
        'lat',
        'bearing',
        'velocity',
        'distance_from_journey_start',
        'distance_from_siri_ride_stop_meters',
      ],
    },
    {
      path: '/gtfs_routes/get',
      table: `${DB}.gtfs_route`,
      fields: [
        'id',
        'date',
        'line_ref',
        'operator_ref',
        'route_short_name',
        'route_long_name',
        'route_mkt',
        'route_direction',
        'route_alternative',
        'agency_name',
        'route_type',
      ],
    },
    {
      path: '/gtfs_rides/get',
      table: `${DB}.gtfs_ride`,
      fields: ['id', 'gtfs_route_id', 'journey_ref', 'start_time', 'end_time'],
    },
    {
      path: '/gtfs_ride_stops/get',
      table: `${DB}.gtfs_ride_stop`,
      fields: [
        'id',
        'gtfs_stop_id',
        'gtfs_ride_id',
        'arrival_time',
        'departure_time',
        'stop_sequence',
        'pickup_type',
        'drop_off_type',
        'shape_dist_traveled',
      ],
    },
    {
      path: '/siri_rides/get',
      table: `${DB}.siri_ride`,
      alias: 'r',
      joins: [`LEFT JOIN ${DB}.siri_ride_gtfs AS lk ON lk.siri_ride_id = r.id`, `LEFT JOIN ${DB}.siri_ride_duration AS d ON d.siri_ride_id = r.id`],
      fields: [
        'id',
        'siri_route_id',
        'journey_ref',
        'scheduled_start_time',
        'vehicle_ref',
        'updated_first_last_vehicle_locations',
        'updated_duration_minutes',
      ],
      related: [
        { alias: 'lk', fields: LINKS },
        { alias: 'd', fields: MEASURED },
      ],
    },
    {
      // `order` is a reserved word, which is why every field here is quoted.
      path: '/siri_ride_stops/get',
      table: `${DB}.siri_ride_stop`,
      fields: ['id', 'siri_stop_id', 'siri_ride_id', 'order', 'gtfs_stop_id', 'nearest_siri_vehicle_location_id'],
    },
    {
      path: '/siri_snapshots/get',
      table: `${DB}.siri_snapshot`,
      fields: [
        'id',
        'snapshot_id',
        'etl_status',
        'etl_start_time',
        'etl_end_time',
        'error',
        'num_successful_parse_vehicle_locations',
        'num_failed_parse_vehicle_locations',
        'num_added_siri_rides',
        'num_added_siri_ride_stops',
        'num_added_siri_routes',
        'num_added_siri_stops',
        'last_heartbeat',
        'created_by',
      ],
    },
  ];

  return { endpoints, getEndpoints };
}
