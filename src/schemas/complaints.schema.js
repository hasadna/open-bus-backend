import { S } from './index.js';

const numberOnly = /^[0-9]+$/u;
const hebOnly = /^[א-ת-\s'"()]+/u;
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u;
const fileType = /^.*\.(?<type>doc|docx|jpeg|jpg|pdf|gif|tiff|png)$/giu;

const mobileSchema = () => S.string().pattern(mobileOnly);
const dateStringSchema = () => S.string().format('date');
const hourStringSchema = () => S.string().pattern(/[012][0-9]:[012][0-9]/u);

export const personalDetailsSchema = S.object()
  .id('PersonalDetailsSchema')
  .prop('firstName', S.string().pattern(hebOnly).minLength(1).maxLength(100).examples(['פרטי']))
  .prop('lastName', S.string().pattern(hebOnly).minLength(1).maxLength(100).examples(['משפחה']))
  .prop('iDNum', S.string().minLength(9).maxLength(9).pattern(numberOnly).examples(['123456782']))
  .prop('email', S.string().format('email').examples(['email@gmail.com']))
  .prop('mobile', mobileSchema().examples(['050-2345678']));

export const requestSubjectSchema = S.object()
  .id('RequestSubjectSchema')
  .prop('applySubject', S.ref('DataCodeModel'))
  .prop('applyType', S.ref('DataCodeModel'));

export const busAndOtherSchema = S.object()
  .id('BusAndOtherSchema')
  .prop('ravKav', S.boolean())
  .prop('singleTrip', S.boolean())
  .prop('ravKavNumber', S.string().minLength(9).maxLength(11).pattern(numberOnly).examples(['123456789']))
  .prop('reportdate', dateStringSchema())
  .prop('reportTime', hourStringSchema())
  .prop('addingFrequencyReason', S.array().items(S.string().enum(['LoadTopics', 'LongWaiting', 'ExtensionHours'])))
  .prop('operator', S.ref('DataCodeModel'))
  .prop('addOrRemoveStation', S.ref('ToggleModel').description('1 = Remove, 2 = Add'))
  .prop('driverName', S.string())
  .prop('licenseNum', S.string())
  .prop('eventDate', dateStringSchema())
  .prop('eventHour', hourStringSchema().examples(['08:00']))
  .prop('fromHour', hourStringSchema().examples(['07:00']))
  .prop('toHour', hourStringSchema().examples(['09:00']))
  .prop('fillByMakatOrAddress', S.ref('ToggleModel').description('1 = Makat Station, 2 = Line Number'))
  .prop('makatStation', S.string())
  .prop('lineNumberText', S.string())
  .prop('lineNumberFromList', S.ref('DataCodeModel'))
  .prop('direction', S.ref('DataCodeModel'))
  .prop('raisingStation', S.ref('DataCodeModel'))
  .prop('applyContent', S.string().minLength(10).maxLength(1000))
  .prop('busDirectionFrom', S.string())
  .prop('busDirectionTo', S.string())
  .prop('raisingStationCity', S.ref('DataCodeModel'))
  .prop('destinationStationCity', S.ref('DataCodeModel'))
  .prop('raisingStationAddress', S.string())
  .prop('cityId', S.string())
  .prop('cityName', S.string())
  .prop('originCityCode', S.string())
  .prop('originCityName', S.string())
  .prop('destinationCityCode', S.string())
  .prop('destinationCityText', S.string())
  .prop('directionCode', S.string())
  .prop('stationName', S.string())
  .prop('lineCode', S.string())
  .prop('firstDeclaration', S.boolean())
  .prop('secondDeclaration', S.boolean());

export const trainSchema = S.object()
  .id('TrainSchema')
  .prop('trainType', S.ref('ToggleModel').description('1 = Israel Train, 2 = Light Train'))
  .prop('eventDate', dateStringSchema())
  .prop('eventHour', hourStringSchema().examples(['08:00']))
  .prop('startStation', S.ref('DataCodeModel'))
  .prop('destinationStation', S.ref('DataCodeModel'))
  .prop('number', S.string())
  .prop('applyContent', S.string().minLength(10).maxLength(1000));

export const taxiSchema = S.object()
  .id('TaxiSchema')
  .prop('eventDetails', S.string())
  .prop('invoice', S.string())
  .prop('evidence', S.string())
  .prop('otherFactors', S.string())
  .prop('taxiType', S.ref('ToggleModel').description('1 = Taxi, 2 = Service Taxi'))
  .prop('driverName', S.string())
  .prop('licenseNum', S.string())
  .prop('cap', S.string())
  .prop('eventDate', dateStringSchema())
  .prop('eventHour', hourStringSchema().examples(['08:00']))
  .prop('eventLocation', S.string())
  .prop('firstDeclaration', S.boolean())
  .prop('secondDeclaration', S.boolean())
  .prop('applyContent', S.string().minLength(10).maxLength(1000));

export const documentsList = S.array()
  .id('DocumentsList')
  .items(
    S.object()
      .prop('attachmentName', S.string().pattern(fileType).examples(['file.png']))
      .prop('data', S.string().maxLength(5120)),
  );

export const complaintFormSchema = S.id('ComplaintFormSchema').anyOf([
  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('requestSubject', S.ref('RequestSubjectSchema'))
    .prop('busAndOther', S.ref('BusAndOtherSchema'))
    .prop('documentsList', S.ref('DocumentsList')),

  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('requestSubject', S.ref('RequestSubjectSchema'))
    .prop('train', S.ref('TrainSchema'))
    .prop('documentsList', S.ref('DocumentsList')),

  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('requestSubject', S.ref('RequestSubjectSchema'))
    .prop('taxi', S.ref('TaxiSchema'))
    .prop('documentsList', S.ref('DocumentsList')),
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
