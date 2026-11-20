import type { ClickHouseColumns } from './clickhouse-columns.js';
import { Type } from './index.js';
import { strideValidationResponse } from './stride.schema.js';

export const gtfsModels = [
  Type.Object(
    {
      date: Type.String({ title: 'Date', format: 'date' }),
      operator_ref: Type.Integer({ title: 'Operator Ref' }),
      agency_name: Type.String({ title: 'Agency Name' }),
    } satisfies ClickHouseColumns<'gtfs_route'>,
    { title: 'GtfsAgencyPydanticModel', $id: 'GtfsAgencyPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      gtfs_route_id: Type.Integer({ title: 'Gtfs Route Id' }),
      journey_ref: Type.Optional(Type.String({ title: 'Journey Ref' })),
      start_time: Type.Optional(Type.String({ title: 'Start Time', format: 'date-time' })),
      end_time: Type.Optional(Type.String({ title: 'End Time', format: 'date-time' })),
    } satisfies ClickHouseColumns<'gtfs_ride'>,
    { title: 'GtfsRidePydanticModel', $id: 'GtfsRidePydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      gtfs_stop_id: Type.Integer({ title: 'Gtfs Stop Id' }),
      gtfs_ride_id: Type.Integer({ title: 'Gtfs Ride Id' }),
      arrival_time: Type.Optional(Type.String({ title: 'Arrival Time', format: 'date-time' })),
      departure_time: Type.Optional(Type.String({ title: 'Departure Time', format: 'date-time' })),
      stop_sequence: Type.Optional(Type.Integer({ title: 'Stop Sequence' })),
      pickup_type: Type.Optional(Type.Integer({ title: 'Pickup Type' })),
      drop_off_type: Type.Optional(Type.Integer({ title: 'Drop Off Type' })),
      shape_dist_traveled: Type.Optional(Type.Integer({ title: 'Shape Dist Traveled' })),
    } satisfies ClickHouseColumns<'gtfs_ride_stop'>,
    { title: 'GtfsRideStopPydanticModel', $id: 'GtfsRideStopPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Optional(Type.Integer({ title: 'Id' })),
      gtfs_stop_id: Type.Optional(Type.Integer({ title: 'Gtfs Stop Id' })),
      gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride Id' })),
      arrival_time: Type.Optional(Type.String({ title: 'Arrival Time', format: 'date-time' })),
      departure_time: Type.Optional(Type.String({ title: 'Departure Time', format: 'date-time' })),
      stop_sequence: Type.Optional(Type.Integer({ title: 'Stop Sequence' })),
      pickup_type: Type.Optional(Type.Integer({ title: 'Pickup Type' })),
      drop_off_type: Type.Optional(Type.Integer({ title: 'Drop Off Type' })),
      shape_dist_traveled: Type.Optional(Type.Integer({ title: 'Shape Dist Traveled' })),
      gtfs_ride__gtfs_route_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride  Gtfs Route Id' })),
      gtfs_ride__journey_ref: Type.Optional(Type.String({ title: 'Gtfs Ride  Journey Ref' })),
      gtfs_ride__start_time: Type.Optional(Type.String({ title: 'Gtfs Ride  Start Time', format: 'date-time' })),
      gtfs_ride__end_time: Type.Optional(Type.String({ title: 'Gtfs Ride  End Time', format: 'date-time' })),
      gtfs_stop__date: Type.Optional(Type.String({ title: 'Gtfs Stop  Date', format: 'date' })),
      gtfs_stop__code: Type.Optional(Type.Integer({ title: 'Gtfs Stop  Code' })),
      gtfs_stop__lat: Type.Optional(Type.Number({ title: 'Gtfs Stop  Lat' })),
      gtfs_stop__lon: Type.Optional(Type.Number({ title: 'Gtfs Stop  Lon' })),
      gtfs_stop__name: Type.Optional(Type.String({ title: 'Gtfs Stop  Name' })),
      gtfs_stop__city: Type.Optional(Type.String({ title: 'Gtfs Stop  City' })),
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
    } satisfies ClickHouseColumns<'gtfs_ride_stop', { gtfs_ride: 'gtfs_ride'; gtfs_stop: 'gtfs_stop'; gtfs_route: 'gtfs_route' }>,
    { title: 'GtfsRideStopWithRelatedPydanticModel', $id: 'GtfsRideStopWithRelatedPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Optional(Type.Integer({ title: 'Id' })),
      gtfs_route_id: Type.Optional(Type.Integer({ title: 'Gtfs Route Id' })),
      journey_ref: Type.Optional(Type.String({ title: 'Journey Ref' })),
      start_time: Type.Optional(Type.String({ title: 'Start Time', format: 'date-time' })),
      end_time: Type.Optional(Type.String({ title: 'End Time', format: 'date-time' })),
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
    } satisfies ClickHouseColumns<'gtfs_ride', { gtfs_route: 'gtfs_route' }>,
    { title: 'GtfsRideWithRelatedPydanticModel', $id: 'GtfsRideWithRelatedPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      date: Type.String({ title: 'Date', format: 'date' }),
      line_ref: Type.Integer({ title: 'Line Ref' }),
      operator_ref: Type.Integer({ title: 'Operator Ref' }),
      route_short_name: Type.Optional(Type.String({ title: 'Route Short Name' })),
      route_long_name: Type.Optional(Type.String({ title: 'Route Long Name' })),
      route_mkt: Type.Optional(Type.String({ title: 'Route Mkt' })),
      route_direction: Type.Optional(Type.String({ title: 'Route Direction' })),
      route_alternative: Type.Optional(Type.String({ title: 'Route Alternative' })),
      agency_name: Type.Optional(Type.String({ title: 'Agency Name' })),
      route_type: Type.Optional(Type.String({ title: 'Route Type' })),
    } satisfies ClickHouseColumns<'gtfs_route'>,
    { title: 'GtfsRoutePydanticModel', $id: 'GtfsRoutePydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      date: Type.String({ title: 'Date', format: 'date' }),
      code: Type.Integer({ title: 'Code' }),
      lat: Type.Optional(Type.Number({ title: 'Lat' })),
      lon: Type.Optional(Type.Number({ title: 'Lon' })),
      name: Type.Optional(Type.String({ title: 'Name' })),
      city: Type.Optional(Type.String({ title: 'City' })),
    } satisfies ClickHouseColumns<'gtfs_stop'>,
    { title: 'GtfsStopPydanticModel', $id: 'GtfsStopPydanticModel' },
  ),
];

export const listGtfsRoutesSchema = {
  path: '/gtfs_routes/list',
  schema: {
    tags: ['gtfs'],
    summary: 'List ',
    description: 'List of gtfs routes.',
    operationId: 'list__gtfs_routes_list_get',
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
      date_from: Type.Optional(
        Type.String({
          title: 'Date From',
          description:
            '\n\nFilter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      date_to: Type.Optional(
        Type.String({
          title: 'Date To',
          description:
            '\n\nFilter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      line_refs: Type.Optional(Type.String({ title: 'Line Refs', description: '\n\nFilter by line ref. Comma-separated list of values.' })),
      operator_refs: Type.Optional(
        Type.String({
          title: 'Operator Refs',
          description:
            'Agency identifier. To get it, first query gtfs_agencies.\n\nFilter by operator ref. Comma-separated list of values.\n\nExample: 3 for Eged',
        }),
      ),
      route_short_name: Type.Optional(
        Type.String({
          title: 'Route Short Name',
          description: 'Line number.\n\nFilter by route short name. Only return items which exactly match given string.\n\nExample: 480',
        }),
      ),
      route_long_name_contains: Type.Optional(
        Type.String({
          title: 'Route Long Name Contains',
          description: '\n\nFilter by route long name. Only return items which contain given string.',
        }),
      ),
      route_mkt: Type.Optional(
        Type.String({ title: 'Route Mkt', description: '\n\nFilter by route mkt. Only return items which exactly match given string.' }),
      ),
      route_direction: Type.Optional(
        Type.String({ title: 'Route Direction', description: '\n\nFilter by route direction. Only return items which exactly match given string.' }),
      ),
      route_alternative: Type.Optional(
        Type.String({
          title: 'Route Alternative',
          description: '\n\nFilter by route alternative. Only return items which exactly match given string.',
        }),
      ),
      agency_name: Type.Optional(
        Type.String({ title: 'Agency Name', description: '\n\nFilter by agency name. Only return items which exactly match given string.' }),
      ),
      route_type: Type.Optional(
        Type.String({ title: 'Route Type', description: '\n\nFilter by route type. Only return items which exactly match given string.' }),
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
      200: Type.Union([Type.Array(Type.Ref('GtfsRoutePydanticModel')), Type.Integer()], {
        title: 'Response List  Gtfs Routes List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getGtfsRoutesSchema = {
  path: '/gtfs_routes/get',
  schema: {
    tags: ['gtfs'],
    summary: 'Get ',
    description: 'Return a single gtfs route based on id',
    operationId: 'get__gtfs_routes_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'gtfs route id to get' }) }),
    response: {
      200: Type.Ref('GtfsRoutePydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listGtfsStopsSchema = {
  path: '/gtfs_stops/list',
  schema: {
    tags: ['gtfs'],
    summary: 'List ',
    description: 'List of gtfs stops.',
    operationId: 'list__gtfs_stops_list_get',
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
      date_from: Type.Optional(
        Type.String({
          title: 'Date From',
          description:
            '\n\nFilter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      date_to: Type.Optional(
        Type.String({
          title: 'Date To',
          description:
            '\n\nFilter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      code: Type.Optional(Type.Integer({ title: 'Code', description: '\n\nFilter by code. Only return items which exactly match given string.' })),
      city: Type.Optional(Type.String({ title: 'City', description: '\n\nFilter by city. Only return items which exactly match given string.' })),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('GtfsStopPydanticModel')), Type.Integer()], {
        title: 'Response List  Gtfs Stops List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getGtfsStopsSchema = {
  path: '/gtfs_stops/get',
  schema: {
    tags: ['gtfs'],
    summary: 'Get ',
    description: 'Return a single gtfs stop based on id',
    operationId: 'get__gtfs_stops_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'gtfs stop id to get' }) }),
    response: {
      200: Type.Ref('GtfsStopPydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listGtfsRidesSchema = {
  path: '/gtfs_rides/list',
  schema: {
    tags: ['gtfs'],
    summary: 'List ',
    description: 'List of gtfs rides.',
    operationId: 'list__gtfs_rides_list_get',
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
      gtfs_route_id: Type.Optional(
        Type.Integer({ title: 'Gtfs Route Id', description: '\n\nFilter by gtfs route id. Only return items which exactly match given string.' }),
      ),
      journey_ref_prefix: Type.Optional(
        Type.String({
          title: 'Journey Ref Prefix',
          description: '\n\nFilter by journey ref prefix. Only return items which start with given string.',
        }),
      ),
      start_time_from: Type.Optional(
        Type.String({
          title: 'Start Time From',
          description:
            '\n\nFilter by start time from. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      start_time_to: Type.Optional(
        Type.String({
          title: 'Start Time To',
          description:
            '\n\nFilter by start time to. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
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
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('GtfsRideWithRelatedPydanticModel')), Type.Integer()], {
        title: 'Response List  Gtfs Rides List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getGtfsRidesSchema = {
  path: '/gtfs_rides/get',
  schema: {
    tags: ['gtfs'],
    summary: 'Get ',
    description: 'Return a single gtfs ride based on id',
    operationId: 'get__gtfs_rides_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'gtfs ride id to get' }) }),
    response: {
      200: Type.Ref('GtfsRidePydanticModel', {
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listGtfsAgenciesSchema = {
  path: '/gtfs_agencies/list',
  schema: {
    tags: ['gtfs'],
    summary: 'List ',
    description: 'List of gtfs agencies.',
    operationId: 'list__gtfs_agencies_list_get',
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
      date_from: Type.Optional(
        Type.String({
          title: 'Date From',
          description:
            '\n\nFilter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      date_to: Type.Optional(
        Type.String({
          title: 'Date To',
          description:
            '\n\nFilter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
    }),
    response: {
      200: Type.Array(Type.Ref('GtfsAgencyPydanticModel'), {
        title: 'Response List  Gtfs Agencies List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listGtfsRideStopsSchema = {
  path: '/gtfs_ride_stops/list',
  schema: {
    tags: ['gtfs'],
    summary: 'List ',
    description:
      'List of gtfs ride stops.\n\nDue to large number of items in the table, you must filter the results by at least one of the following:\n\n1. gtfs_ride_ids - containing a single gtfs ride id.\n2. arrival_time_from and arrival_time_to - containing a time range.\n\nAdditional filters can be applied in addition to one of the above options to narrow down the results.',
    operationId: 'list__gtfs_ride_stops_list_get',
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
      arrival_time_from: Type.Optional(
        Type.String({
          title: 'Arrival Time From',
          description:
            '\n\nFilter by arrival time from. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      arrival_time_to: Type.Optional(
        Type.String({
          title: 'Arrival Time To',
          description:
            '\n\nFilter by arrival time to. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      gtfs_stop_ids: Type.Optional(
        Type.String({ title: 'Gtfs Stop Ids', description: '\n\nFilter by gtfs stop id. Comma-separated list of values.' }),
      ),
      gtfs_ride_ids: Type.Optional(
        Type.String({ title: 'Gtfs Ride Ids', description: '\n\nFilter by gtfs ride id. Comma-separated list of values.' }),
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
      gtfs_stop__date_from: Type.Optional(
        Type.String({
          title: 'Gtfs Stop  Date From',
          description:
            '\n\nFilter by related gtfs stop\'s date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      gtfs_stop__date_to: Type.Optional(
        Type.String({
          title: 'Gtfs Stop  Date To',
          description:
            '\n\nFilter by related gtfs stop\'s date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
          format: 'date',
        }),
      ),
      gtfs_stop__code: Type.Optional(
        Type.Integer({
          title: 'Gtfs Stop  Code',
          description: "\n\nFilter by related gtfs stop's code. Only return items which exactly match given string.",
        }),
      ),
      gtfs_stop__city: Type.Optional(
        Type.String({
          title: 'Gtfs Stop  City',
          description: "\n\nFilter by related gtfs stop's city. Only return items which exactly match given string.",
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
      order_by: Type.Optional(
        Type.String({
          title: 'Order By',
          description: 'Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".',
          default: 'id asc',
        }),
      ),
    }),
    response: {
      200: Type.Union([Type.Array(Type.Ref('GtfsRideStopWithRelatedPydanticModel')), Type.Integer()], {
        title: 'Response List  Gtfs Ride Stops List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const getGtfsRideStopsSchema = {
  path: '/gtfs_ride_stops/get',
  schema: {
    tags: ['gtfs'],
    summary: 'Get ',
    description: 'Return a single gtfs ride stop based on id',
    operationId: 'get__gtfs_ride_stops_get_get',
    querystring: Type.Object({ id: Type.Integer({ title: 'Id', description: 'gtfs ride stop id to get' }) }),
    response: {
      200: Type.Ref('GtfsRideStopPydanticModel', { description: 'Successful Response' }),
      422: strideValidationResponse,
    },
  },
};
