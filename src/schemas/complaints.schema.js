import { S } from './index.js';

// const complaintsUserDataSchema = S.object()
//   .id('ComplaintsUserDataSchema')
//   .prop('firstName', S.string().maxLength(25))
//   .prop('lastName', S.string().maxLength(25))
//   .prop('id', S.string().maxLength(9).pattern(/\d+/u))
//   .prop('email', S.string().format('email'))
//   .prop('phone', S.string().maxLength(11))
//   .prop('complaintType', S.string())
//   .prop('description', S.string().minLength(2).maxLength(1500))
//   .prop('from', S.string().maxLength(90))
//   .prop('to', S.string().maxLength(90))
//   .prop('timeEvent', S.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/u))
//   .prop('startWait', S.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/u))
//   .prop('endWait', S.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/u))
//   .prop('ravkavId', S.string().maxLength(10))
//   .required(['firstName', 'lastName', 'id', 'email', 'phone', 'complaintType', 'description']);

// const complaintsDataBusDataModel = S.object()
//   .id('ComplaintsDataBusDataModel')
//   .prop('id', S.number())
//   .prop('siriRouteId', S.number())
//   .prop('journeyRef', S.string())
//   .prop('scheduledStartTime', S.string().format('date-time'))
//   .prop('vehicleRef', S.string())
//   .prop('updatedFirstLastVehicleLocations', S.string().format('date-time'))
//   .prop('firstVehicleLocationId', S.number())
//   .prop('lastVehicleLocationId', S.number())
//   .prop('updatedDurationMinutes', S.string().format('date-time'))
//   .prop('durationMinutes', S.number())
//   .prop('journeyGtfsRideId', S.number())
//   .prop('routeGtfsRideId', S.number())
//   .prop('gtfsRideId', S.number())
//   .prop('siriRouteLineRef', S.number())
//   .prop('siriRouteOperatorRef', S.number())
//   .prop('gtfsRideGtfsRouteId', S.number())
//   .prop('gtfsRideJourneyRef', S.string())
//   .prop('gtfsRideStartTime', S.string().format('date-time'))
//   .prop('gtfsRideEndTime', S.string().format('date-time'))
//   .prop('gtfsRouteDate', S.string().format('date-time'))
//   .prop('gtfsRouteLineRef', S.number())
//   .prop('gtfsRouteOperatorRef', S.number())
//   .prop('gtfsRouteRouteShortName', S.string())
//   .prop('gtfsRouteRouteLongName', S.string())
//   .prop('gtfsRouteRouteMkt', S.string())
//   .prop('gtfsRouteRouteDirection', S.string())
//   .prop('gtfsRouteRouteAlternative', S.string())
//   .prop('gtfsRouteAgencyName', S.string())
//   .prop('gtfsRouteRouteType', S.string());

export const dataCodeSchema = S.object()
  .id('DataCodeSchema')
  .prop('dataCode', S.anyOf([S.string(), S.number()]))
  .prop('dataText', S.string());

export const contactIdSchema = S.object().id('ContactIdSchema').prop('ticketNumber', S.string());

export const contactIdResultSchema = S.object()
  .id('ContactIdResultSchema')
  .prop('dateReceived', S.string())
  .prop('contactName', S.string())
  .prop('incidentStatus', S.string())
  .prop('ticketNumber', S.string());

export const contactTypeSchema = S.object().id('ContactTypeSchema').prop('selectContactType', S.string()).prop('isChosenType', S.boolean());

export const personalDetailsSchema = S.object()
  .id('PersonalDetailsSchema')
  .prop('name', S.string().enum(['personalDetails']))
  .prop('state', S.string().enum(['completed', 'notValidated']))
  .prop('next', S.string())
  .prop('prev', S.string())
  .prop('isClosed', S.boolean())
  .prop('firstName', S.string())
  .prop('lastName', S.string())
  .prop('iDNum', S.string())
  .prop('mobile', S.string())
  .prop('phone', S.string())
  .prop('contactOptions', S.string())
  .prop('fax', S.string())
  .prop('email', S.string())
  .prop('city', S.ref('DataCodeSchema'))
  .prop('street', S.string())
  .prop('houseNumber', S.string())
  .prop('appartment', S.string())
  .prop('postBox', S.string())
  .prop('zipCode', S.string());

export const requestSubjectSchema = S.object()
  .id('RequestSubjectSchema')
  .prop('name', S.string().enum(['requestSubject']))
  .prop('state', S.string().enum(['completed', 'notValidated']))
  .prop('next', S.string())
  .prop('prev', S.string())
  .prop('isClosed', S.boolean())
  .prop('applySubject', S.ref('DataCodeSchema'))
  .prop('applyType', S.ref('DataCodeSchema'));

export const taxiDetailsSchema = S.object()
  .id('TaxiDetailsSchema')
  .prop('eventDetails', S.string())
  .prop('invoice', S.string())
  .prop('evidence', S.string())
  .prop('otherFactors', S.string())
  .prop('taxiType', S.string())
  .prop('licenseNum', S.string())
  .prop('cap', S.string())
  .prop('eventDate', S.string())
  .prop('eventHour', S.string())
  .prop('eventLocation', S.string())
  .prop('firstDeclaration', S.boolean())
  .prop('secondDeclaration', S.boolean());

export const busAndOtherDetailsSchema = S.object()
  .id('BusAndOtherDetailsSchema')
  .prop('ravKav', S.boolean())
  .prop('ravKavNumber', S.string())
  .prop('reportdate', S.string())
  .prop('reportTime', S.string())
  .prop('addingFrequencyReason', S.array().items(S.enum(['LoadTopics', 'LongWaiting', 'ExtensionHours'])))
  .prop('operator', S.ref('DataCodeSchema'))
  .prop('addOrRemoveStation', S.string())
  .prop('driverName', S.string())
  .prop('licenseNum', S.string())
  .prop('eventDate', S.string())
  .prop('eventHour', S.string())
  .prop('fromHour', S.string())
  .prop('toHour', S.string())
  .prop('fillByMakatOrAddress', S.string())
  .prop('makatStation', S.string())
  .prop('lineNumberText', S.string())
  .prop('lineNumberFromList', S.ref('DataCodeSchema'))
  .prop('direction', S.ref('DataCodeSchema'))
  .prop('raisingStation', S.ref('DataCodeSchema'))
  .prop('applyContent', S.string())
  .prop('busDirectionFrom', S.string())
  .prop('busDirectionTo', S.string())
  .prop('raisingStationCity', S.ref('DataCodeSchema'))
  .prop('destinationStationCity', S.ref('DataCodeSchema'))
  .prop('raisingStationAddress', S.string())
  .prop('cityId', S.string())
  .prop('cityName', S.string())
  .prop('raisingStationCityCode', S.string())
  .prop('raisingStationCityName', S.string())
  .prop('destinationStationCityCode', S.string())
  .prop('destinationStationCityText', S.string())
  .prop('directionCode', S.string())
  .prop('stationName', S.string())
  .prop('lineCode', S.string());

export const trainDetailsSchema = S.object()
  .id('TrainDetailsSchema')
  .prop('trainType', S.string())
  .prop('eventDate', S.string())
  .prop('eventHour', S.string())
  .prop('startStation', S.ref('DataCodeSchema'))
  .prop('destinationStation', S.ref('DataCodeSchema'))
  .prop('number', S.string())
  .prop('applyContent', S.string());

export const requestDetailsSchema = S.object()
  .id('RequestDetailsSchema')
  .prop('name', S.string().enum(['requestDetails']))
  .prop('state', S.string().enum(['completed', 'notValidated']))
  .prop('next', S.string())
  .prop('prev', S.string())
  .prop('isClosed', S.boolean())
  .prop('taxi', S.ref('TaxiDetailsSchema'))
  .prop('busAndOther', S.ref('BusAndOtherDetailsSchema'))
  .prop('train', S.ref('TrainDetailsSchema'))
  .prop('requestSubjectCode', S.string())
  .prop('requestTypeCode', S.string())
  .prop('title', S.string());

export const documentAttachmentSchema = S.object()
  .id('DocumentAttachmentSchema')
  .prop('name', S.string().enum(['documentAttachment']))
  .prop('state', S.string().enum(['completed', 'notValidated']))
  .prop('next', S.string())
  .prop('prev', S.string())
  .prop('isClosed', S.boolean())
  .prop('documentsList', S.array().items(S.object().prop('attacmentName', S.string())));

export const followStatusSchema = S.object()
  .id('FollowStatusSchema')
  .prop('name', S.string().enum(['followStatus']))
  .prop('state', S.string().enum(['completed', 'notValidated']))
  .prop('next', S.string())
  .prop('prev', S.string())
  .prop('isClosed', S.boolean())
  .prop('contactIdList', S.array().items(S.ref('ContactIdSchema')))
  .prop('contactIdResultList', S.array().items(S.ref('ContactIdResultSchema')));

export const containersViewModelSchema = S.object()
  .id('ContainersViewModelSchema')
  .prop('showPrintButton', S.boolean())
  .prop('isTabsMode', S.boolean())
  .prop('validatedStatus', S.boolean());

export const formInformationSchema = S.object()
  .id('FormInformationSchema')
  .prop('referenceNumber', S.string())
  .prop('stageStatus', S.string())
  .prop('loadingDate', S.string())
  .prop('firstLoadingDate', S.string())
  .prop('isMobile', S.boolean())
  .prop('language', S.string());

export const formDataModelSchema = S.object()
  .id('FormDataModelSchema')
  .prop('contactType', S.ref('ContactTypeSchema'))
  .prop('personalDetails', S.ref('PersonalDetailsSchema'))
  .prop('requestSubject', S.ref('RequestSubjectSchema'))
  .prop('requestDetails', S.ref('RequestDetailsSchema'))
  .prop('documentAttachment', S.ref('DocumentAttachmentSchema'))
  .prop('followStatus', S.ref('FollowStatusSchema'))
  .prop('containersViewModel', S.ref('ContainersViewModelSchema'))
  .prop('formInformation', S.ref('FormInformationSchema'));

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
    .prop('data', S.ref('FormDataModelSchema')),
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
