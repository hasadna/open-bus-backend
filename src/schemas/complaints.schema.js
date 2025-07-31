import { S } from './index.js';

/**
 * Send complaint endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const sendComplaintSchema = {
  tags: ['Complaints'],
  summary: 'Send a complaint',
  description: 'Submits a complaint to the government forms system',
  body: S.object()
    .prop('debug', S.boolean().description('Enable debug mode to return XML without sending').default(true))
    .prop(
      'userData',
      S.object()
        .prop('firstName', S.string().minLength(1).maxLength(100).description('First name of the complainant'))
        .prop('lastName', S.string().minLength(1).maxLength(100).description('Last name of the complainant'))
        .prop('id', S.string().pattern('^[0-9]{9}$').description('ID number of the complainant'))
        .prop('email', S.string().format('email').description('Email address of the complainant'))
        .prop('phone', S.string().default('1234567890').description('Phone number of the complainant'))
        .prop('complaintType', S.string().description('Type of complaint (e.g., no_stop)'))
        .prop('description', S.string().minLength(10).maxLength(1000).description('Detailed description of the complaint'))
        .required(['firstName', 'lastName', 'id', 'email', 'phone']),
    )
    .prop(
      'databusData',
      S.object(),
      // .prop('operator', S.number().description('Bus operator ID'))
      // .prop('loc', S.array().items([S.number(), S.number()]).description('Location coordinates [longitude, latitude]'))
      // .prop('color', S.number().description('Bus color code'))
      // .prop('bearing', S.number().description('Direction bearing in degrees'))
      // .prop('recorded_at_time', S.number().description('Timestamp when the incident was recorded'))
      // .prop(
      //   'point',
      //   S.object()
      //     .prop('id', S.number())
      //     .prop('siri_snapshot_id', S.number())
      //     .prop('siri_ride_stop_id', S.number())
      //     .prop('recorded_at_time', S.string().format('date-time'))
      //     .prop('lon', S.number())
      //     .prop('lat', S.number())
      //     .prop('bearing', S.number())
      //     .prop('velocity', S.number())
      //     .prop('distance_from_journey_start', S.number())
      //     .prop('distance_from_siri_ride_stop_meters', S.number()),
      // ),
      // .required(['operator']),
    ),
  response: {
    200: S.object()
      .prop('success', S.boolean())
      .prop('debug', S.boolean())
      .prop('xml', S.string().description('Generated XML (only in debug mode)'))
      .prop('data', S.object().description('Response data from the government forms system'))
      .prop('referenceNumber', S.string().description('Generated reference number')),
    400: S.object().prop('error', S.string()).prop('details', S.object()),
    500: S.object().prop('error', S.string()).prop('message', S.string()),
  },
};
