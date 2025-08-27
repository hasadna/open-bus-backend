import { S } from './index.js';

export const complaintsUserDataSchema = S.object()
  .id('ComplaintsUserDataSchema')
  .prop('firstName', S.string().maxLength(25))
  .prop('lastName', S.string().maxLength(25))
  .prop('id', S.string().maxLength(9).pattern(/\d+/u))
  .prop('email', S.string().format('email'))
  .prop('phone', S.string().maxLength(11))
  .prop('complaintType', S.string())
  .prop('description', S.string().minLength(2).maxLength(1500))
  .prop('from', S.string().maxLength(90))
  .prop('to', S.string().maxLength(90))
  .prop('timeEvent', S.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/u))
  .prop('startWait', S.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/u))
  .prop('endWait', S.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/u))
  .required(['firstName', 'lastName', 'id', 'email', 'phone', 'complaintType', 'description', 'timeEvent', 'startWait', 'endWait']);

export const complaintsDataBusDataModel = S.object()
  .id('ComplaintsDataBusDataModel')
  .prop('id', S.number())
  .prop('siriRouteId', S.number())
  .prop('journeyRef', S.string())
  .prop('scheduledStartTime', S.string().format('date-time'))
  .prop('vehicleRef', S.string())
  .prop('updatedFirstLastVehicleLocations', S.string().format('date-time'))
  .prop('firstVehicleLocationId', S.number())
  .prop('lastVehicleLocationId', S.number())
  .prop('updatedDurationMinutes', S.string().format('date-time'))
  .prop('durationMinutes', S.number())
  .prop('journeyGtfsRideId', S.number())
  .prop('routeGtfsRideId', S.number())
  .prop('gtfsRideId', S.number())
  .prop('siriRouteLineRef', S.number())
  .prop('siriRouteOperatorRef', S.number())
  .prop('gtfsRideGtfsRouteId', S.number())
  .prop('gtfsRideJourneyRef', S.string())
  .prop('gtfsRideStartTime', S.string().format('date-time'))
  .prop('gtfsRideEndTime', S.string().format('date-time'))
  .prop('gtfsRouteDate', S.string().format('date-time'))
  .prop('gtfsRouteLineRef', S.number())
  .prop('gtfsRouteOperatorRef', S.number())
  .prop('gtfsRouteRouteShortName', S.string())
  .prop('gtfsRouteRouteLongName', S.string())
  .prop('gtfsRouteRouteMkt', S.string())
  .prop('gtfsRouteRouteDirection', S.string())
  .prop('gtfsRouteRouteAlternative', S.string())
  .prop('gtfsRouteAgencyName', S.string())
  .prop('gtfsRouteRouteType', S.string());

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
    .prop('userData', S.ref('ComplaintsUserDataSchema'))
    .prop('databusData', S.ref('ComplaintsDataBusDataModel')),
  response: {
    200: S.object()
      .prop('success', S.boolean())
      .prop('debug', S.boolean())
      .prop('xml', S.string().description('Generated XML (only in debug mode)'))
      .prop('data', S.object().description('Response data from the government forms system'))
      .prop('referenceNumber', S.string().description('Generated reference number')),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};
