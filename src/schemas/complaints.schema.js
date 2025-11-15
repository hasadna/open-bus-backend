import { S } from './index.js';

const MobileSchema = () => S.string().pattern('^05\\d(-)?[2-9]\\d{6}$');
const DateStringSchema = () => S.string().format('date'); // YYYY-MM-DD
const HourStringSchema = () => S.string().pattern('^([01]\\d|2[0-3]):([0-5]\\d)$');
const AttachmentSchema = () =>
  S.object().prop('attachmentName', S.string().pattern('.*\\.(docx|jpeg|jpg|pdf|doc|gif|tiff|png)$')).prop('data', S.string().maxLength(5120));

export const PersonalDetailsSchema = S.object()
  .id('PersonalDetailsSchema')
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('iDNum', S.string().required())
  .prop('email', S.string().required())
  .prop('mobile', MobileSchema().required())
  .prop('applySubject', S.ref('DataCodeModel'))
  .prop('applyType', S.ref('DataCodeModel'));

export const BusAndOtherSchema = S.object()
  .id('BusAndOtherSchema')
  .prop('ravKav', S.boolean())
  .prop('ravKavNumber', S.string())
  .prop('reportdate', DateStringSchema())
  .prop('reportTime', HourStringSchema())
  .prop('addingFrequencyReason', S.array().items(S.string().enum(['LoadTopics', 'LongWaiting', 'ExtensionHours'])))
  .prop('operator', S.ref('DataCodeModel'))
  .prop('addOrRemoveStation', S.string().enum(['1', '2'])) // 1 = Remove, 2 = Add
  .prop('driverName', S.string())
  .prop('licenseNum', S.string())
  .prop('eventDate', DateStringSchema())
  .prop('eventHour', HourStringSchema())
  .prop('fromHour', HourStringSchema())
  .prop('toHour', HourStringSchema())
  .prop('fillByMakatOrAddress', S.string().enum(['1', '2'])) // 1 = Makat Station, 2 = Line Number
  .prop('makatStation', S.string())
  .prop('lineNumberText', S.string())
  .prop('lineNumberFromList', S.ref('DataCodeModel'))
  .prop('direction', S.ref('DataCodeModel'))
  .prop('raisingStation', S.ref('DataCodeModel'))
  .prop('applyContent', S.string())
  .prop('busDirectionFrom', S.string())
  .prop('busDirectionTo', S.string())
  .prop('raisingStationCity', S.ref('DataCodeModel'))
  .prop('destinationStationCity', S.ref('DataCodeModel'))
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

export const TrainSchema = S.object()
  .id('TrainSchema')
  .prop('trainType', S.string().enum(['1', '2'])) // 1 = Israel Train, 2 = Light Train
  .prop('eventDate', DateStringSchema())
  .prop('eventHour', HourStringSchema())
  .prop('startStation', S.ref('DataCodeModel'))
  .prop('destinationStation', S.ref('DataCodeModel'))
  .prop('number', S.string())
  .prop('applyContent', S.string());

export const TaxiSchema = S.object()
  .id('TaxiSchema')
  .prop('eventDetails', S.string())
  .prop('invoice', S.string())
  .prop('evidence', S.string())
  .prop('otherFactors', S.string())
  .prop('taxiType', S.string().enum(['1', '2'])) // 1 = Taxi, 2 = Service Taxi
  .prop('licenseNum', S.string())
  .prop('cap', S.string())
  .prop('eventDate', DateStringSchema())
  .prop('eventHour', HourStringSchema())
  .prop('eventLocation', S.string())
  .prop('firstDeclaration', S.boolean())
  .prop('secondDeclaration', S.boolean())
  .prop('applyContent', S.string());

export const ComplaintFormSchema = S.id('ComplaintFormSchema').anyOf([
  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('busAndOther', S.ref('BusAndOtherSchema'))
    .prop('documentsList', S.array().items(AttachmentSchema())),

  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('train', S.ref('TrainSchema'))
    .prop('documentsList', S.array().items(AttachmentSchema())),

  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('taix', S.ref('TaxiSchema'))
    .prop('documentsList', S.array().items(AttachmentSchema())),
]);

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
    .prop('data', S.ref('ComplaintFormSchema')),
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
