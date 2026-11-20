import { Type } from './index.js';
import { strideValidationResponse } from './stride.schema.js';

export const analyticsModels = [
  Type.Object(
    {
      gtfs_route_date: Type.Optional(Type.String({ title: 'Gtfs Route Date', format: 'date' })),
      gtfs_route_hour: Type.Optional(Type.String({ title: 'Gtfs Route Hour', format: 'date' })),
      operator_ref: Type.Optional(Type.Integer({ title: 'Operator Ref' })),
      day_of_week: Type.Optional(Type.String({ title: 'Day Of Week' })),
      line_ref: Type.Optional(Type.Integer({ title: 'Line Ref' })),
      route_short_name: Type.Optional(Type.String({ title: 'Route Short Name' })),
      route_long_name: Type.Optional(Type.String({ title: 'Route Long Name' })),
      total_routes: Type.Integer({ title: 'Total Routes' }),
      total_planned_rides: Type.Integer({ title: 'Total Planned Rides' }),
      total_actual_rides: Type.Integer({ title: 'Total Actual Rides' }),
    },
    { title: 'GtfsRidesAggGroupByPydanticModel', $id: 'GtfsRidesAggGroupByPydanticModel' },
  ),
  Type.Object(
    {
      gtfs_route_id: Type.Integer({ title: 'Gtfs Route Id' }),
      gtfs_route_hour: Type.String({ title: 'Gtfs Route Hour', format: 'date' }),
      num_planned_rides: Type.Integer({ title: 'Num Planned Rides' }),
      num_actual_rides: Type.Integer({ title: 'Num Actual Rides' }),
      operator_ref: Type.Integer({ title: 'Operator Ref' }),
    },
    { title: 'GtfsRidesAggPydanticModel', $id: 'GtfsRidesAggPydanticModel' },
  ),
  Type.Object(
    {
      planned_start_time: Type.Optional(Type.String({ title: 'Planned Start Time', format: 'date-time' })),
      actual_start_time: Type.Optional(Type.String({ title: 'Actual Start Time', format: 'date-time' })),
      gtfs_ride_id: Type.Optional(Type.Integer({ title: 'Gtfs Ride Id' })),
    },
    { title: 'RideExecutionPydanticModel', $id: 'RideExecutionPydanticModel' },
  ),
  Type.Object(
    {
      id: Type.Integer({ title: 'Id' }),
      name: Type.Optional(Type.String({ title: 'Name' })),
      city: Type.Optional(Type.String({ title: 'City' })),
      lon: Type.Optional(Type.Number({ title: 'Lon' })),
      lat: Type.Optional(Type.Number({ title: 'Lat' })),
      planned_arrival_time: Type.Optional(Type.String({ title: 'Planned Arrival Time', format: 'date-time' })),
      gtfs_line_ref: Type.Optional(Type.String({ title: 'Gtfs Line Ref' })),
      gtfs_line_start_time: Type.Optional(Type.String({ title: 'Gtfs Line Start Time', format: 'date-time' })),
      gtfs_ride_id: Type.Optional(Type.String({ title: 'Gtfs Ride Id' })),
    },
    { title: 'RouteTimetablePydanticModel', $id: 'RouteTimetablePydanticModel' },
  ),
  Type.Object(
    {
      rounded_lon: Type.Number({ title: 'Rounded Lon' }),
      rounded_lat: Type.Number({ title: 'Rounded Lat' }),
      total_sample_count: Type.Integer({ title: 'Total Sample Count' }),
      average_rolling_avg: Type.Optional(Type.Number({ title: 'Average Rolling Avg' })),
      stddev_rolling_avg: Type.Optional(Type.Number({ title: 'Stddev Rolling Avg' })),
    },
    { title: 'SiriVelocityAggregationPydanticModel', $id: 'SiriVelocityAggregationPydanticModel' },
  ),
  Type.Object(
    {
      actual_arrival_time: Type.Optional(Type.String({ title: 'Actual Arrival Time', format: 'date-time' })),
    },
    { title: 'StopArrivalPydanticModel', $id: 'StopArrivalPydanticModel' },
  ),
];

export const listRouteTimetableSchema = {
  path: '/route_timetable/list',
  schema: {
    tags: ['analytics'],
    summary: 'List ',
    description: 'List of the stops timetable of a given bus.\nCurrently, only planned time (gtfs) is returned for every stop.',
    operationId: 'list__route_timetable_list_get',
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
      planned_start_time_date_from: Type.Optional(
        Type.String({
          title: 'Planned Start Time Date From',
          description:
            'Set a time range to get the timetable of a specific ride\n\nFilter by planned_start_time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      planned_start_time_date_to: Type.Optional(
        Type.String({
          title: 'Planned Start Time Date To',
          description:
            'Set a time range to get the time table of a specific ride\n\nFilter by planned_start_time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T15:48:49+02:00". Note that all date/times must have a timezone specification.',
          format: 'date-time',
        }),
      ),
      line_refs: Type.Optional(
        Type.String({
          title: 'Line Refs',
          description: 'To get a line ref, first query gtfs_routes\n\nFilter by line_ref. Comma-separated list of values.',
        }),
      ),
    }),
    response: {
      200: Type.Array(Type.Ref('RouteTimetablePydanticModel'), {
        title: 'Response List  Route Timetable List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listStopArrivalsSchema = {
  path: '/stop_arrivals/list',
  schema: {
    tags: ['analytics'],
    summary: 'List ',
    description: 'List of the actual arrival times to a specific stop.\nCurrently, only planned time (gtfs) is returned for every stop.',
    operationId: 'list__stop_arrivals_list_get',
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
      gtfs_stop_id: Type.Optional(
        Type.Integer({
          title: 'Gtfs Stop Id',
          description: 'To get a line ref, first query gtfs_routes\n\nFilter by gtfs_stop_id. Only return items which exactly match given string.',
        }),
      ),
      gtfs_ride_ids: Type.Optional(
        Type.String({
          title: 'Gtfs Ride Ids',
          description: 'To get a line ref, first query gtfs_routes\n\nFilter by line_ref. Comma-separated list of values.',
        }),
      ),
    }),
    response: {
      200: Type.Array(Type.Ref('StopArrivalPydanticModel'), {
        title: 'Response List  Stop Arrivals List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listRidesExecutionSchema = {
  path: '/rides_execution/list',
  schema: {
    tags: ['analytics'],
    summary: 'List ',
    description:
      'List of A comparison between the planned and actual rides of a specific route between the given dates.\nCurrently, the "actual_rides_count", will be either None (no actual ride) or equal to the "planned_rides_count.',
    operationId: 'list__rides_execution_list_get',
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
      date_from: Type.String({
        title: 'Date From',
        description:
          '\n\nFilter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
        format: 'date',
      }),
      date_to: Type.String({
        title: 'Date To',
        description:
          '\n\nFilter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
        format: 'date',
      }),
      operator_ref: Type.Integer({
        title: 'Operator Ref',
        description: 'Line operator ref.\n\nFilter by operator_ref. Only return items which exactly match given string.',
      }),
      line_ref: Type.Integer({
        title: 'Line Ref',
        description: 'Line ref.\n\nFilter by line_ref. Only return items which exactly match given string.',
      }),
    }),
    response: {
      200: Type.Array(Type.Ref('RideExecutionPydanticModel'), {
        title: 'Response List  Rides Execution List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const siriVelocityAggregationSchema = {
  path: '/siri_velocity_aggregation/siri_velocity_aggregation',
  schema: {
    tags: ['analytics'],
    summary: 'Siri Velocity Aggregation',
    operationId: 'siri_velocity_aggregation_siri_velocity_aggregation_siri_velocity_aggregation_get',
    querystring: Type.Object({
      recorded_from: Type.String({ title: 'Recorded From', description: 'start of recorded_at_time range, inclusive', format: 'date-time' }),
      lon_min: Type.Optional(Type.Number({ title: 'Lon Min', description: 'minimum longitude bound', default: 34.25 })),
      lon_max: Type.Optional(Type.Number({ title: 'Lon Max', description: 'maximum longitude bound', default: 35.7 })),
      lat_min: Type.Optional(Type.Number({ title: 'Lat Min', description: 'minimum latitude bound', default: 29.5 })),
      lat_max: Type.Optional(Type.Number({ title: 'Lat Max', description: 'maximum latitude bound', default: 33.33 })),
      rounding_precision: Type.Optional(
        Type.Integer({ title: 'Rounding Precision', maximum: 10, minimum: 0, description: 'lon/lat scaling factor, in powers of 2', default: 2 }),
      ),
    }),
    response: {
      200: Type.Array(Type.Ref('SiriVelocityAggregationPydanticModel'), {
        title: 'Response Siri Velocity Aggregation Siri Velocity Aggregation Siri Velocity Aggregation Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const listGtfsRidesAggSchema = {
  path: '/gtfs_rides_agg/list',
  schema: {
    tags: ['analytics'],
    summary: 'List ',
    description: 'List of gtfs rides aggregations.',
    operationId: 'list__gtfs_rides_agg_list_get',
    querystring: Type.Object({
      limit: Type.Optional(
        Type.Integer({
          title: 'Limit',
          description:
            'Limit the number of returned results. If not specified will limit to 1000 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.',
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
      date_from: Type.String({
        title: 'Date From',
        description:
          '\n\nFilter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
        format: 'date',
      }),
      date_to: Type.String({
        title: 'Date To',
        description:
          '\n\nFilter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
        format: 'date',
      }),
      exclude_hours_from: Type.Optional(
        Type.Integer({
          title: 'Exclude Hours From',
          description:
            'Hours to exclude from search, currently used to filter out edge cases.\n\nFilter by hour. Only return items which have an hour date after or equals to given value. Format: 0(12AM)-23',
        }),
      ),
      exclude_hours_to: Type.Optional(
        Type.Integer({
          title: 'Exclude Hours To',
          description:
            'Hours to exclude from search, currently used to filter out edge cases.\n\nFilter by hour. Only return items which have a date before or equals to given value. Format: 0(12AM)-23',
        }),
      ),
    }),
    response: {
      200: Type.Array(Type.Ref('GtfsRidesAggPydanticModel'), {
        title: 'Response List  Gtfs Rides Agg List Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};

export const groupByGtfsRidesAggSchema = {
  path: '/gtfs_rides_agg/group_by',
  schema: {
    tags: ['analytics'],
    summary: 'Group By ',
    description: 'gtfs rides aggregation grouped by given fields.',
    operationId: 'group_by__gtfs_rides_agg_group_by_get',
    querystring: Type.Object({
      date_from: Type.String({
        title: 'Date From',
        description:
          '\n\nFilter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
        format: 'date',
      }),
      date_to: Type.String({
        title: 'Date To',
        description:
          '\n\nFilter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".',
        format: 'date',
      }),
      exclude_hours_from: Type.Optional(
        Type.Integer({
          title: 'Exclude Hours From',
          description:
            'Hours to exclude from search, currently used to filter out edge cases.\n\nFilter by hour. Only return items which have an hour date after or equals to given value. Format: 0(12AM)-23',
        }),
      ),
      exclude_hours_to: Type.Optional(
        Type.Integer({
          title: 'Exclude Hours To',
          description:
            'Hours to exclude from search, currently used to filter out edge cases.\n\nFilter by hour. Only return items which have a date before or equals to given value. Format: 0(12AM)-23',
        }),
      ),
      group_by: Type.String({
        title: 'Group By',
        description:
          'Comma-separated list of fields to group by. Valid values: gtfs_route_date, gtfs_route_hour, operator_ref, day_of_week, line_ref.',
      }),
    }),
    response: {
      200: Type.Array(Type.Ref('GtfsRidesAggGroupByPydanticModel'), {
        title: 'Response Group By  Gtfs Rides Agg Group By Get',
        description: 'Successful Response',
      }),
      422: strideValidationResponse,
    },
  },
};
