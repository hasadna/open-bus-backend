import type { ClickHouseColumns } from './clickhouse-columns.js';
import { Type } from './index.js';
import { strideValidationResponse } from './stride.schema.js';

export const siriModels = [
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      siri_route_id: Type.Integer({ title: 'Siri Route Id' }),
      journey_ref: Type.String({ title: 'Journey Ref' }),
      scheduled_start_time: Type.String({ title: 'Scheduled Start Time', format: 'date-time' }),
      vehicle_ref: Type.Optional(Type.String({ title: 'Vehicle Ref' })),
      updated_first_last_vehicle_locations: Type.Optional(Type.String({ title: 'Updated First Last Vehicle Locations', format: 'date-time' })),
      first_vehicle_location_id: Type.Optional(Type.Integer({ title: 'First Vehicle Location Id' })),
      last_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Last Vehicle Location Id' })),
      updated_duration_minutes: Type.Optional(Type.String({ title: 'Updated Duration Minutes', format: 'date-time' })),
      duration_minutes: Type.Optional(Type.Integer({ title: 'Duration Minutes' })),
      journey_gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Journey Gtfs Ride Id' })),
      route_gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Route Gtfs Ride Id' })),
      gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride Id' })),
    } satisfies ClickHouseColumns<'siri_ride'>,
    { title: 'SiriRidePydanticModel', $id: 'SiriRidePydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      siri_stop_id: Type.Integer({ title: 'Siri Stop Id' }),
      siri_ride_id: Type.Integer({ title: 'Siri Ride Id' }),
      order: Type.Integer({ title: 'Order' }),
      gtfs_stop_id: Type.Optional(Type.Integer({ title: 'Gtfs Stop Id' })),
      nearest_siri_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Nearest Siri Vehicle Location Id' })),
    } satisfies ClickHouseColumns<'siri_ride_stop'>,
    { title: 'SiriRideStopPydanticModel', $id: 'SiriRideStopPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Optional(Type.Integer({ title: 'Id' })),
      siri_stop_id: Type.Optional(Type.Integer({ title: 'Siri Stop Id' })),
      siri_ride_id: Type.Optional(Type.Integer({ title: 'Siri Ride Id' })),
      order: Type.Optional(Type.Integer({ title: 'Order' })),
      gtfs_stop_id: Type.Optional(Type.Integer({ title: 'Gtfs Stop Id' })),
      nearest_siri_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Nearest Siri Vehicle Location Id' })),
      siri_stop__code: Type.Optional(Type.Integer({ title: 'Siri Stop  Code' })),
      siri_ride__siri_route_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Siri Route Id' })),
      siri_ride__journey_ref: Type.Optional(Type.String({ title: 'Siri Ride  Journey Ref' })),
      siri_ride__scheduled_start_time: Type.Optional(Type.String({ title: 'Siri Ride  Scheduled Start Time', format: 'date-time' })),
      siri_ride__vehicle_ref: Type.Optional(Type.String({ title: 'Siri Ride  Vehicle Ref' })),
      siri_ride__updated_first_last_vehicle_locations: Type.Optional(
        Type.String({ title: 'Siri Ride  Updated First Last Vehicle Locations', format: 'date-time' }),
      ),
      siri_ride__first_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Siri Ride  First Vehicle Location Id' })),
      siri_ride__last_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Last Vehicle Location Id' })),
      siri_ride__updated_duration_minutes: Type.Optional(Type.String({ title: 'Siri Ride  Updated Duration Minutes', format: 'date-time' })),
      siri_ride__duration_minutes: Type.Optional(Type.Integer({ title: 'Siri Ride  Duration Minutes' })),
      siri_ride__journey_gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Journey Gtfs Ride Id' })),
      siri_ride__route_gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Route Gtfs Ride Id' })),
      siri_ride__gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Gtfs Ride Id' })),
      gtfs_stop__date: Type.Optional(Type.String({ title: 'Gtfs Stop  Date', format: 'date' })),
      gtfs_stop__code: Type.Optional(Type.Integer({ title: 'Gtfs Stop  Code' })),
      gtfs_stop__lat: Type.Optional(Type.Number({ title: 'Gtfs Stop  Lat' })),
      gtfs_stop__lon: Type.Optional(Type.Number({ title: 'Gtfs Stop  Lon' })),
      gtfs_stop__name: Type.Optional(Type.String({ title: 'Gtfs Stop  Name' })),
      gtfs_stop__city: Type.Optional(Type.String({ title: 'Gtfs Stop  City' })),
      nearest_siri_vehicle_location__siri_snapshot_id: Type.Optional(Type.Integer({ title: 'Nearest Siri Vehicle Location  Siri Snapshot Id' })),
      nearest_siri_vehicle_location__siri_ride_stop_id: Type.Optional(Type.Integer({ title: 'Nearest Siri Vehicle Location  Siri Ride Stop Id' })),
      nearest_siri_vehicle_location__recorded_at_time: Type.Optional(
        Type.String({ title: 'Nearest Siri Vehicle Location  Recorded At Time', format: 'date-time' }),
      ),
      nearest_siri_vehicle_location__lon: Type.Optional(Type.Number({ title: 'Nearest Siri Vehicle Location  Lon' })),
      nearest_siri_vehicle_location__lat: Type.Optional(Type.Number({ title: 'Nearest Siri Vehicle Location  Lat' })),
      nearest_siri_vehicle_location__bearing: Type.Optional(Type.Integer({ title: 'Nearest Siri Vehicle Location  Bearing' })),
      nearest_siri_vehicle_location__velocity: Type.Optional(Type.Integer({ title: 'Nearest Siri Vehicle Location  Velocity' })),
      nearest_siri_vehicle_location__distance_from_journey_start: Type.Optional(
        Type.Integer({ title: 'Nearest Siri Vehicle Location  Distance From Journey Start' }),
      ),
      nearest_siri_vehicle_location__distance_from_siri_ride_stop_meters: Type.Optional(
        Type.Integer({ title: 'Nearest Siri Vehicle Location  Distance From Siri Ride Stop Meters' }),
      ),
      gtfs_ride_stop__gtfs_stop_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride Stop  Gtfs Stop Id' })),
      gtfs_ride_stop__gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride Stop  Gtfs Ride Id' })),
      gtfs_ride_stop__arrival_time: Type.Optional(Type.String({ title: 'Gtfs Ride Stop  Arrival Time', format: 'date-time' })),
      gtfs_ride_stop__departure_time: Type.Optional(Type.String({ title: 'Gtfs Ride Stop  Departure Time', format: 'date-time' })),
      gtfs_ride_stop__stop_sequence: Type.Optional(Type.Integer({ title: 'Gtfs Ride Stop  Stop Sequence' })),
      gtfs_ride_stop__pickup_type: Type.Optional(Type.Integer({ title: 'Gtfs Ride Stop  Pickup Type' })),
      gtfs_ride_stop__drop_off_type: Type.Optional(Type.Integer({ title: 'Gtfs Ride Stop  Drop Off Type' })),
      gtfs_ride_stop__shape_dist_traveled: Type.Optional(Type.Integer({ title: 'Gtfs Ride Stop  Shape Dist Traveled' })),
      gtfs_ride__gtfs_route_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride  Gtfs Route Id' })),
      gtfs_ride__journey_ref: Type.Optional(Type.String({ title: 'Gtfs Ride  Journey Ref' })),
      gtfs_ride__start_time: Type.Optional(Type.String({ title: 'Gtfs Ride  Start Time', format: 'date-time' })),
      gtfs_ride__end_time: Type.Optional(Type.String({ title: 'Gtfs Ride  End Time', format: 'date-time' })),
      gtfs_route__date: Type.Optional(Type.String({ title: 'Gtfs Route  Date', format: 'date' })),
      gtfs_route__line_ref: Type.Optional(Type.Integer({ title: 'Gtfs Route  Line Ref' })),
      gtfs_route__operator_ref: Type.Optional(Type.Integer({ title: 'Gtfs Route  Operator Ref' })),
      gtfs_route__route_short_name: Type.Optional(Type.String({ title: 'Gtfs Route  Route Short Name' })),
      gtfs_route__route_long_name: Type.Optional(Type.String({ title: 'Gtfs Route  Route Long Name' })),
      gtfs_route__route_mkt: Type.Optional(Type.String({ title: 'Gtfs Route  Route Mkt' })),
      gtfs_route__route_direction: Type.Optional(Type.String({ title: 'Gtfs Route  Route Direction' })),
      gtfs_route__route_alternative: Type.Optional(Type.String({ title: 'Gtfs Route  Route Alternative' })),
      gtfs_route__agency_name: Type.Optional(Type.String({ title: 'Gtfs Route  Agency Name' })),
      gtfs_route__route_type: Type.Optional(Type.String({ title: 'Gtfs Route  Route Type' })),
    } satisfies ClickHouseColumns<
      'siri_ride_stop',
      {
        siri_stop: 'siri_stop';
        siri_ride: 'siri_ride';
        gtfs_stop: 'gtfs_stop';
        nearest_siri_vehicle_location: 'siri_vehicle_location';
        gtfs_ride_stop: 'gtfs_ride_stop';
        gtfs_ride: 'gtfs_ride';
        gtfs_route: 'gtfs_route';
      }
    >,
    { title: 'SiriRideStopWithRelatedPydanticModel', $id: 'SiriRideStopWithRelatedPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Optional(Type.Integer({ title: 'Id' })),
      siri_route_id: Type.Optional(Type.Integer({ title: 'Siri Route Id' })),
      journey_ref: Type.Optional(Type.String({ title: 'Journey Ref' })),
      scheduled_start_time: Type.Optional(Type.String({ title: 'Scheduled Start Time', format: 'date-time' })),
      vehicle_ref: Type.Optional(Type.String({ title: 'Vehicle Ref' })),
      updated_first_last_vehicle_locations: Type.Optional(Type.String({ title: 'Updated First Last Vehicle Locations', format: 'date-time' })),
      first_vehicle_location_id: Type.Optional(Type.Integer({ title: 'First Vehicle Location Id' })),
      last_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Last Vehicle Location Id' })),
      updated_duration_minutes: Type.Optional(Type.String({ title: 'Updated Duration Minutes', format: 'date-time' })),
      duration_minutes: Type.Optional(Type.Integer({ title: 'Duration Minutes' })),
      journey_gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Journey Gtfs Ride Id' })),
      route_gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Route Gtfs Ride Id' })),
      gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride Id' })),
      siri_route__line_ref: Type.Optional(Type.Integer({ title: 'Siri Route  Line Ref' })),
      siri_route__operator_ref: Type.Optional(Type.Integer({ title: 'Siri Route  Operator Ref' })),
      gtfs_ride__gtfs_route_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride  Gtfs Route Id' })),
      gtfs_ride__journey_ref: Type.Optional(Type.String({ title: 'Gtfs Ride  Journey Ref' })),
      gtfs_ride__start_time: Type.Optional(Type.String({ title: 'Gtfs Ride  Start Time', format: 'date-time' })),
      gtfs_ride__end_time: Type.Optional(Type.String({ title: 'Gtfs Ride  End Time', format: 'date-time' })),
      gtfs_route__date: Type.Optional(Type.String({ title: 'Gtfs Route  Date', format: 'date' })),
      gtfs_route__line_ref: Type.Optional(Type.Integer({ title: 'Gtfs Route  Line Ref' })),
      gtfs_route__operator_ref: Type.Optional(Type.Integer({ title: 'Gtfs Route  Operator Ref' })),
      gtfs_route__route_short_name: Type.Optional(Type.String({ title: 'Gtfs Route  Route Short Name' })),
      gtfs_route__route_long_name: Type.Optional(Type.String({ title: 'Gtfs Route  Route Long Name' })),
      gtfs_route__route_mkt: Type.Optional(Type.String({ title: 'Gtfs Route  Route Mkt' })),
      gtfs_route__route_direction: Type.Optional(Type.String({ title: 'Gtfs Route  Route Direction' })),
      gtfs_route__route_alternative: Type.Optional(Type.String({ title: 'Gtfs Route  Route Alternative' })),
      gtfs_route__agency_name: Type.Optional(Type.String({ title: 'Gtfs Route  Agency Name' })),
      gtfs_route__route_type: Type.Optional(Type.String({ title: 'Gtfs Route  Route Type' })),
    } satisfies ClickHouseColumns<'siri_ride', { siri_route: 'siri_route'; gtfs_ride: 'gtfs_ride'; gtfs_route: 'gtfs_route' }>,
    { title: 'SiriRideWithRelatedPydanticModel', $id: 'SiriRideWithRelatedPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      line_ref: Type.Integer({ title: 'Line Ref' }),
      operator_ref: Type.Integer({ title: 'Operator Ref' }),
    } satisfies ClickHouseColumns<'siri_route'>,
    { title: 'SiriRoutePydanticModel', $id: 'SiriRoutePydanticModel' },
  ),
  Type.Enum(['pending', 'loading', 'loaded', 'error', 'deleted'], {
    title: 'SiriSnapshotEtlStatusEnum',
    description: 'An enumeration.',
    $id: 'SiriSnapshotEtlStatusEnum',
  }),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      snapshot_id: Type.String({ title: 'Snapshot Id' }),
      etl_status: Type.Ref('SiriSnapshotEtlStatusEnum'),
      etl_start_time: Type.Optional(Type.String({ title: 'Etl Start Time', format: 'date-time' })),
      etl_end_time: Type.Optional(Type.String({ title: 'Etl End Time', format: 'date-time' })),
      error: Type.Optional(Type.String({ title: 'Error' })),
      num_successful_parse_vehicle_locations: Type.Optional(Type.Integer({ title: 'Num Successful Parse Vehicle Locations' })),
      num_failed_parse_vehicle_locations: Type.Optional(Type.Integer({ title: 'Num Failed Parse Vehicle Locations' })),
      num_added_siri_rides: Type.Optional(Type.Integer({ title: 'Num Added Siri Rides' })),
      num_added_siri_ride_stops: Type.Optional(Type.Integer({ title: 'Num Added Siri Ride Stops' })),
      num_added_siri_routes: Type.Optional(Type.Integer({ title: 'Num Added Siri Routes' })),
      num_added_siri_stops: Type.Optional(Type.Integer({ title: 'Num Added Siri Stops' })),
      last_heartbeat: Type.Optional(Type.String({ title: 'Last Heartbeat', format: 'date-time' })),
      created_by: Type.Optional(Type.String({ title: 'Created By' })),
    } satisfies ClickHouseColumns<'siri_snapshot'>,
    { title: 'SiriSnapshotPydanticModel', $id: 'SiriSnapshotPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      code: Type.Integer({ title: 'Code' }),
    } satisfies ClickHouseColumns<'siri_stop'>,
    { title: 'SiriStopPydanticModel', $id: 'SiriStopPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      siri_snapshot_id: Type.Integer({ title: 'Siri Snapshot Id' }),
      siri_ride_stop_id: Type.Integer({ title: 'Siri Ride Stop Id' }),
      recorded_at_time: Type.String({ title: 'Recorded At Time', format: 'date-time' }),
      lon: Type.Number({ title: 'Lon' }),
      lat: Type.Number({ title: 'Lat' }),
      bearing: Type.Integer({ title: 'Bearing' }),
      velocity: Type.Integer({ title: 'Velocity' }),
      distance_from_journey_start: Type.Integer({ title: 'Distance From Journey Start' }),
      distance_from_siri_ride_stop_meters: Type.Optional(Type.Integer({ title: 'Distance From Siri Ride Stop Meters' })),
    } satisfies ClickHouseColumns<'siri_vehicle_location'>,
    { title: 'SiriVehicleLocationPydanticModel', $id: 'SiriVehicleLocationPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Optional(Type.Integer({ title: 'Id' })),
      siri_snapshot_id: Type.Optional(Type.Integer({ title: 'Siri Snapshot Id' })),
      siri_ride_stop_id: Type.Optional(Type.Integer({ title: 'Siri Ride Stop Id' })),
      recorded_at_time: Type.Optional(Type.String({ title: 'Recorded At Time', format: 'date-time' })),
      lon: Type.Optional(Type.Number({ title: 'Lon' })),
      lat: Type.Optional(Type.Number({ title: 'Lat' })),
      bearing: Type.Optional(Type.Integer({ title: 'Bearing' })),
      velocity: Type.Optional(Type.Integer({ title: 'Velocity' })),
      distance_from_journey_start: Type.Optional(Type.Integer({ title: 'Distance From Journey Start' })),
      distance_from_siri_ride_stop_meters: Type.Optional(Type.Integer({ title: 'Distance From Siri Ride Stop Meters' })),
      siri_snapshot__snapshot_id: Type.Optional(Type.String({ title: 'Siri Snapshot  Snapshot Id' })),
      siri_route__id: Type.Optional(Type.Integer({ title: 'Siri Route  Id' })),
      siri_route__line_ref: Type.Optional(Type.Integer({ title: 'Siri Route  Line Ref' })),
      siri_route__operator_ref: Type.Optional(Type.Integer({ title: 'Siri Route  Operator Ref' })),
      siri_ride__id: Type.Optional(Type.Integer({ title: 'Siri Ride  Id' })),
      siri_ride__journey_ref: Type.Optional(Type.String({ title: 'Siri Ride  Journey Ref' })),
      siri_ride__scheduled_start_time: Type.Optional(Type.String({ title: 'Siri Ride  Scheduled Start Time', format: 'date-time' })),
      siri_ride__vehicle_ref: Type.Optional(Type.String({ title: 'Siri Ride  Vehicle Ref' })),
      siri_ride__first_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Siri Ride  First Vehicle Location Id' })),
      siri_ride__last_vehicle_location_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Last Vehicle Location Id' })),
      siri_ride__duration_minutes: Type.Optional(Type.Integer({ title: 'Siri Ride  Duration Minutes' })),
      siri_ride__gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Siri Ride  Gtfs Ride Id' })),
    } satisfies ClickHouseColumns<'siri_vehicle_location', { siri_snapshot: 'siri_snapshot'; siri_route: 'siri_route'; siri_ride: 'siri_ride' }>,
    { title: 'SiriVehicleLocationWithRelatedPydanticModel', $id: 'SiriVehicleLocationWithRelatedPydanticModel' },
  ),
];

export const listSiriRoutesSchema = {
  path: '/siri_routes/list',
  schema: {
    tags: ['siri'],
    summary: 'List ',
    description: 'List of siri routes.',
    operationId: 'list__siri_routes_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
        }),
      ),
      offset: Type.Optional(
        Type.Integer({
          title: 'Offset',
          description:
            "Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.",
        }),
      ),
      get_count: Type.Optional(
        Type.Boolean({
          title: 'Get Count',
          description: 'Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.',
          default: false,
        }),
      ),
      line_refs: Type.Optional(Type.String({ title: 'Line Refs', description: '\n\nFilter by line ref. Comma-separated list of values.' })),
      operator_refs: Type.Optional(
        Type.String({ title: 'Operator Refs', description: '\n\nFilter by operator ref. Comma-separated list of values.' }),
      ),
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('SiriRoutePydanticModel')), Type.Integer()], {
        title: 'Response List  Siri Routes List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getSiriRoutesSchema = {
  path: '/siri_routes/get',
  schema: {
    tags: ['siri'],
    summary: 'Get ',
    description: 'Return a single siri route based on id',
    operationId: 'get__siri_routes_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'siri route id to get' }) }),
    response: {
      200: Type.Ref('SiriRoutePydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listSiriRidesSchema = {
  path: '/siri_rides/list',
  schema: {
    tags: ['siri'],
    summary: 'List ',
    description: 'List of siri rides.',
    operationId: 'list__siri_rides_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
        }),
      ),
      offset: Type.Optional(
        Type.Integer({
          title: 'Offset',
          description:
            "Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.",
        }),
      ),
      get_count: Type.Optional(
        Type.Boolean({
          title: 'Get Count',
          description: 'Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.',
          default: false,
        }),
      ),
      gtfs_route__date_from: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Date From',
          description:
            '\n\nFilter by related gtfs route\'s date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      gtfs_route__date_to: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Date To',
          description:
            '\n\nFilter by related gtfs route\'s date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      gtfs_route__line_refs: Type.Optional(
        Type.String({ title: 'Gtfs Route  Line Refs', description: "\n\nFilter by related gtfs route's line ref. Comma-separated list of values." }),
      ),
      gtfs_route__operator_refs: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Operator Refs',
          description:
            "Agency identifier. To get it, first query gtfs_agencies.\n\nFilter by related gtfs route's operator ref. Comma-separated list of values.\n\nExample: 3 for Eged",
        }),
      ),
      gtfs_route__route_short_name: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Route Short Name',
          description:
            "Line number.\n\nFilter by related gtfs route's route short name. Only return items which exactly match given string.\n\nExample: 480",
        }),
      ),
      gtfs_route__route_long_name_contains: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Route Long Name Contains',
          description: "\n\nFilter by related gtfs route's route long name. Only return items which contain given string.",
        }),
      ),
      gtfs_route__route_mkt: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Route Mkt',
          description: "\n\nFilter by related gtfs route's route mkt. Only return items which exactly match given string.",
        }),
      ),
      gtfs_route__route_direction: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Route Direction',
          description: "\n\nFilter by related gtfs route's route direction. Only return items which exactly match given string.",
        }),
      ),
      gtfs_route__route_alternative: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Route Alternative',
          description: "\n\nFilter by related gtfs route's route alternative. Only return items which exactly match given string.",
        }),
      ),
      gtfs_route__agency_name: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Agency Name',
          description: "\n\nFilter by related gtfs route's agency name. Only return items which exactly match given string.",
        }),
      ),
      gtfs_route__route_type: Type.Optional(
        Type.String({
          title: 'Gtfs Route  Route Type',
          description: "\n\nFilter by related gtfs route's route type. Only return items which exactly match given string.",
        }),
      ),
      gtfs_ride__gtfs_route_id: Type.Optional(
        Type.Integer({
          title: 'Gtfs Ride  Gtfs Route Id',
          description: "\n\nFilter by related gtfs ride's gtfs route id. Only return items which exactly match given string.",
        }),
      ),
      gtfs_ride__journey_ref_prefix: Type.Optional(
        Type.String({
          title: 'Gtfs Ride  Journey Ref Prefix',
          description: "\n\nFilter by related gtfs ride's journey ref prefix. Only return items which start with given string.",
        }),
      ),
      gtfs_ride__start_time_from: Type.Optional(
        Type.String({
          title: 'Gtfs Ride  Start Time From',
          description:
            '\n\nFilter by related gtfs ride\'s start time from. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      gtfs_ride__start_time_to: Type.Optional(
        Type.String({
          title: 'Gtfs Ride  Start Time To',
          description:
            '\n\nFilter by related gtfs ride\'s start time to. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_route_ids: Type.Optional(
        Type.String({ title: 'Siri Route Ids', description: '\n\nFilter by siri route ids. Comma-separated list of values.' }),
      ),
      siri_route__line_refs: Type.Optional(
        Type.String({ title: 'Siri Route  Line Refs', description: '\n\nFilter by siri route line refs. Comma-separated list of values.' }),
      ),
      siri_route__operator_refs: Type.Optional(
        Type.String({ title: 'Siri Route  Operator Refs', description: '\n\nFilter by siri route operator refs. Comma-separated list of values.' }),
      ),
      journey_ref_prefix: Type.Optional(
        Type.String({
          title: 'Journey Ref Prefix',
          description: '\n\nFilter by journey ref prefix. Only return items which start with given string.',
        }),
      ),
      journey_refs: Type.Optional(Type.String({ title: 'Journey Refs', description: '\n\nFilter by journey ref. Comma-separated list of values.' })),
      vehicle_refs: Type.Optional(Type.String({ title: 'Vehicle Refs', description: '\n\nFilter by vehicle ref. Comma-separated list of values.' })),
      scheduled_start_time_from: Type.Optional(
        Type.String({
          title: 'Scheduled Start Time From',
          description:
            '\n\nFilter by scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      scheduled_start_time_to: Type.Optional(
        Type.String({
          title: 'Scheduled Start Time To',
          description:
            '\n\nFilter by scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('SiriRideWithRelatedPydanticModel')), Type.Integer()], {
        title: 'Response List  Siri Rides List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getSiriRidesSchema = {
  path: '/siri_rides/get',
  schema: {
    tags: ['siri'],
    summary: 'Get ',
    description: 'Return a single siri ride based on id',
    operationId: 'get__siri_rides_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'siri ride id to get' }) }),
    response: {
      200: Type.Ref('SiriRidePydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listSiriStopsSchema = {
  path: '/siri_stops/list',
  schema: {
    tags: ['siri'],
    summary: 'List ',
    description: 'List of siri stops.',
    operationId: 'list__siri_stops_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
        }),
      ),
      offset: Type.Optional(
        Type.Integer({
          title: 'Offset',
          description:
            "Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.",
        }),
      ),
      get_count: Type.Optional(
        Type.Boolean({
          title: 'Get Count',
          description: 'Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.',
          default: false,
        }),
      ),
      codes: Type.Optional(Type.String({ title: 'Codes', description: '\n\nFilter by stop code. Comma-separated list of values.' })),
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('SiriStopPydanticModel')), Type.Integer()], {
        title: 'Response List  Siri Stops List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getSiriStopsSchema = {
  path: '/siri_stops/get',
  schema: {
    tags: ['siri'],
    summary: 'Get ',
    description: 'Return a single siri stop based on id',
    operationId: 'get__siri_stops_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'siri stop id to get' }) }),
    response: {
      200: Type.Ref('SiriStopPydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listSiriRideStopsSchema = {
  path: '/siri_ride_stops/list',
  schema: {
    tags: ['siri'],
    summary: 'List ',
    description: 'List of siri ride stops.',
    operationId: 'list__siri_ride_stops_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
        }),
      ),
      offset: Type.Optional(
        Type.Integer({
          title: 'Offset',
          description:
            "Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.",
        }),
      ),
      get_count: Type.Optional(
        Type.Boolean({
          title: 'Get Count',
          description: 'Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.',
          default: false,
        }),
      ),
      siri_stop_ids: Type.Optional(
        Type.String({ title: 'Siri Stop Ids', description: '\n\nFilter by siri stop id. Comma-separated list of values.' }),
      ),
      siri_ride_ids: Type.Optional(
        Type.String({ title: 'Siri Ride Ids', description: '\n\nFilter by siri ride id. Comma-separated list of values.' }),
      ),
      siri_vehicle_location__lon__greater_or_equal: Type.Optional(
        Type.Number({
          title: 'Siri Vehicle Location  Lon  Greater Or Equal',
          description:
            '\n\nFilter by siri vehicle location lon. Only return items which have a numeric value greater than or equal to given value\n\nExample: 34.808',
        }),
      ),
      siri_vehicle_location__lon__lower_or_equal: Type.Optional(
        Type.Number({
          title: 'Siri Vehicle Location  Lon  Lower Or Equal',
          description:
            '\n\nFilter by siri vehicle location lon. Only return items which have a numeric value lower than or equal to given value\n\nExample: 34.808',
        }),
      ),
      siri_vehicle_location__lat__greater_or_equal: Type.Optional(
        Type.Number({
          title: 'Siri Vehicle Location  Lat  Greater Or Equal',
          description:
            '\n\nFilter by siri vehicle location lat. Only return items which have a numeric value greater than or equal to given value\n\nExample: 31.961',
        }),
      ),
      siri_vehicle_location__lat__lower_or_equal: Type.Optional(
        Type.Number({
          title: 'Siri Vehicle Location  Lat  Lower Or Equal',
          description:
            '\n\nFilter by siri vehicle location lat. Only return items which have a numeric value lower than or equal to given value\n\nExample: 31.961',
        }),
      ),
      siri_vehicle_location__recorded_at_time_from: Type.Optional(
        Type.String({
          title: 'Siri Vehicle Location  Recorded At Time From',
          description:
            '\n\nFilter by siri vehicle location recorded at time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_vehicle_location__recorded_at_time_to: Type.Optional(
        Type.String({
          title: 'Siri Vehicle Location  Recorded At Time To',
          description:
            '\n\nFilter by siri vehicle location recorded at time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_ride__scheduled_start_time_from: Type.Optional(
        Type.String({
          title: 'Siri Ride  Scheduled Start Time From',
          description:
            '\n\nFilter by siri ride scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_ride__scheduled_start_time_to: Type.Optional(
        Type.String({
          title: 'Siri Ride  Scheduled Start Time To',
          description:
            '\n\nFilter by siri ride scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      gtfs_stop__lat__greater_or_equal: Type.Optional(
        Type.Number({
          title: 'Gtfs Stop  Lat  Greater Or Equal',
          description:
            '\n\nFilter by gtfs stop lat. Only return items which have a numeric value greater than or equal to given value\n\nExample: 31.961',
        }),
      ),
      gtfs_stop__lat__lower_or_equal: Type.Optional(
        Type.Number({
          title: 'Gtfs Stop  Lat  Lower Or Equal',
          description:
            '\n\nFilter by gtfs stop lat. Only return items which have a numeric value lower than or equal to given value\n\nExample: 31.961',
        }),
      ),
      gtfs_stop__lon__greater_or_equal: Type.Optional(
        Type.Number({
          title: 'Gtfs Stop  Lon  Greater Or Equal',
          description:
            '\n\nFilter by gtfs stop lon. Only return items which have a numeric value greater than or equal to given value\n\nExample: 34.808',
        }),
      ),
      gtfs_stop__lon__lower_or_equal: Type.Optional(
        Type.Number({
          title: 'Gtfs Stop  Lon  Lower Or Equal',
          description:
            '\n\nFilter by gtfs stop lon. Only return items which have a numeric value lower than or equal to given value\n\nExample: 34.808',
        }),
      ),
      gtfs_date_from: Type.Optional(
        Type.String({
          title: 'Gtfs Date From',
          description:
            'filter all gtfs related records on this date\n\nFilter by gtfs date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      gtfs_date_to: Type.Optional(
        Type.String({
          title: 'Gtfs Date To',
          description:
            'filter all gtfs related records on this date\n\nFilter by gtfs date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: '',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('SiriRideStopWithRelatedPydanticModel')), Type.Integer()], {
        title: 'Response List  Siri Ride Stops List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getSiriRideStopsSchema = {
  path: '/siri_ride_stops/get',
  schema: {
    tags: ['siri'],
    summary: 'Get ',
    description: 'Return a single siri ride stop based on id',
    operationId: 'get__siri_ride_stops_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'siri ride stop id to get' }) }),
    response: {
      200: Type.Ref('SiriRideStopPydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listSiriVehicleLocationsSchema = {
  path: '/siri_vehicle_locations/list',
  schema: {
    tags: ['siri'],
    summary: 'List ',
    description: 'List of siri vehicle locations.',
    operationId: 'list__siri_vehicle_locations_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
        }),
      ),
      offset: Type.Optional(
        Type.Integer({
          title: 'Offset',
          description:
            "Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.",
        }),
      ),
      get_count: Type.Optional(
        Type.Boolean({
          title: 'Get Count',
          description: 'Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.',
          default: false,
        }),
      ),
      siri_vehicle_location_ids: Type.Optional(
        Type.String({ title: 'Siri Vehicle Location Ids', description: '\n\nFilter by siri vehicle location id. Comma-separated list of values.' }),
      ),
      siri_snapshot_ids: Type.Optional(
        Type.String({ title: 'Siri Snapshot Ids', description: '\n\nFilter by siri snapshot id. Comma-separated list of values.' }),
      ),
      siri_ride_stop_ids: Type.Optional(
        Type.String({ title: 'Siri Ride Stop Ids', description: '\n\nFilter by siri ride stop id. Comma-separated list of values.' }),
      ),
      recorded_at_time_from: Type.Optional(
        Type.String({
          title: 'Recorded At Time From',
          description:
            '\n\nFilter by recorded at time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      recorded_at_time_to: Type.Optional(
        Type.String({
          title: 'Recorded At Time To',
          description:
            '\n\nFilter by recorded at time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      lon__greater_or_equal: Type.Optional(
        Type.Number({
          title: 'Lon  Greater Or Equal',
          description: '\n\nFilter by lon. Only return items which have a numeric value greater than or equal to given value\n\nExample: 34.808',
        }),
      ),
      lon__lower_or_equal: Type.Optional(
        Type.Number({
          title: 'Lon  Lower Or Equal',
          description: '\n\nFilter by lon. Only return items which have a numeric value lower than or equal to given value\n\nExample: 34.808',
        }),
      ),
      lat__greater_or_equal: Type.Optional(
        Type.Number({
          title: 'Lat  Greater Or Equal',
          description: '\n\nFilter by lat. Only return items which have a numeric value greater than or equal to given value\n\nExample: 31.961',
        }),
      ),
      lat__lower_or_equal: Type.Optional(
        Type.Number({
          title: 'Lat  Lower Or Equal',
          description: '\n\nFilter by lat. Only return items which have a numeric value lower than or equal to given value\n\nExample: 31.961',
        }),
      ),
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
      siri_routes__line_ref: Type.Optional(
        Type.String({
          title: 'Siri Routes  Line Ref',
          description: '\n\nFilter by siri route line ref. Only return items which exactly match given string.',
        }),
      ),
      siri_ride__vehicle_ref: Type.Optional(
        Type.String({
          title: 'Siri Ride  Vehicle Ref',
          description: '\n\nFilter by siri ride vehicle ref. Only return items which exactly match given string.',
        }),
      ),
      siri_routes__operator_ref: Type.Optional(
        Type.String({
          title: 'Siri Routes  Operator Ref',
          description: '\n\nFilter by siri route operator ref. Only return items which exactly match given string.',
        }),
      ),
      siri_rides__ids: Type.Optional(
        Type.String({ title: 'Siri Rides  Ids', description: '\n\nFilter by siri ride id. Comma-separated list of values.' }),
      ),
      siri_routes__ids: Type.Optional(
        Type.String({ title: 'Siri Routes  Ids', description: '\n\nFilter by siri route id. Comma-separated list of values.' }),
      ),
      siri_rides__schedualed_start_time_from: Type.Optional(
        Type.String({
          title: 'Siri Rides  Schedualed Start Time From',
          description:
            '[DEPRECATED] Misspelled parameter name, kept for backward compatibility. Use "siri_rides__scheduled_start_time_from" instead.\n\nFilter by siri ride scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_rides__schedualed_start_time_to: Type.Optional(
        Type.String({
          title: 'Siri Rides  Schedualed Start Time To',
          description:
            '[DEPRECATED] Misspelled parameter name, kept for backward compatibility. Use "siri_rides__scheduled_start_time_to" instead.\n\nFilter by siri ride scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_rides__scheduled_start_time_from: Type.Optional(
        Type.String({
          title: 'Siri Rides  Scheduled Start Time From',
          description:
            'Preferred parameter. Replaces the deprecated "siri_rides__schedualed_start_time_from".\n\nFilter by siri ride scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      siri_rides__scheduled_start_time_to: Type.Optional(
        Type.String({
          title: 'Siri Rides  Scheduled Start Time To',
          description:
            'Preferred parameter. Replaces the deprecated "siri_rides__schedualed_start_time_to".\n\nFilter by siri ride scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('SiriVehicleLocationWithRelatedPydanticModel')), Type.Integer()], {
        title: 'Response List  Siri Vehicle Locations List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getSiriVehicleLocationsSchema = {
  path: '/siri_vehicle_locations/get',
  schema: {
    tags: ['siri'],
    summary: 'Get ',
    description: 'Return a single siri vehicle location based on id',
    operationId: 'get__siri_vehicle_locations_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'siri vehicle location id to get' }) }),
    response: {
      200: Type.Ref('SiriVehicleLocationPydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listSiriSnapshotsSchema = {
  path: '/siri_snapshots/list',
  schema: {
    tags: ['siri'],
    summary: 'List ',
    description: 'List of siri snapshots.',
    operationId: 'list__siri_snapshots_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
        }),
      ),
      offset: Type.Optional(
        Type.Integer({
          title: 'Offset',
          description:
            "Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.",
        }),
      ),
      get_count: Type.Optional(
        Type.Boolean({
          title: 'Get Count',
          description: 'Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.',
          default: false,
        }),
      ),
      snapshot_id_prefix: Type.Optional(
        Type.String({
          title: 'Snapshot Id Prefix',
          description: '\n\nFilter by snapshot id prefix. Only return items which start with given string.',
        }),
      ),
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('SiriSnapshotPydanticModel')), Type.Integer()], {
        title: 'Response List  Siri Snapshots List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getSiriSnapshotsSchema = {
  path: '/siri_snapshots/get',
  schema: {
    tags: ['siri'],
    summary: 'Get ',
    description: 'Return a single siri snapshot based on id',
    operationId: 'get__siri_snapshots_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'siri snapshot id to get' }) }),
    response: {
      200: Type.Ref('SiriSnapshotPydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};
