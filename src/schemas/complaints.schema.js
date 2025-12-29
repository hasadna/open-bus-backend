import { S } from './index.js';

const numberOnly = /^[0-9]+$/u;
const hebOnly = /^[א-ת-\s'"()]+/u;
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u;
const fileType = /^.*\.(?<type>doc|docx|jpeg|jpg|pdf|gif|tiff|png)$/giu;

const mobileSchema = () => S.string().pattern(mobileOnly);
const dateStringSchema = () => S.string().format('date-time');
const hourStringSchema = () => S.string().pattern(/[012][0-9]:[012][0-9]/u);

export const personalDetailsSchema = S.object()
  .id('PersonalDetailsSchema')
  .prop('firstName', S.string().pattern(hebOnly).minLength(1).maxLength(100).examples(['נעם']))
  .prop('lastName', S.string().pattern(hebOnly).minLength(1).maxLength(100).examples(['געש']))
  .prop('iDNum', S.string().minLength(9).maxLength(9).pattern(numberOnly).examples(['123456782']))
  .prop('email', S.string().format('email').examples(['noam.gaash@gmail.com']))
  .prop('mobile', mobileSchema().examples(['053-2234567']));

export const requestSubjectSchema = S.object()
  .id('RequestSubjectSchema')
  .prop('applySubject', S.ref('DataCodeModel').examples([{ dataCode: '0', dataText: 'אוטובוס' }]))
  .prop('applyType', S.ref('DataCodeModel').examples([{ dataCode: '3', dataText: 'אי עצירה בתחנה' }]));

export const busAndOtherSchema = S.object()
  .id('BusAndOtherSchema')
  .prop('ravKav', S.boolean().examples([true]))
  .prop('singleTrip', S.boolean().examples([false]))
  .prop('ravKavNumber', S.string().minLength(9).maxLength(11).pattern(numberOnly).examples(['123456789']))
  .prop('reportdate', dateStringSchema().examples(['']))
  .prop('reportTime', hourStringSchema().examples(['']))
  .prop(
    'addingFrequencyReason',
    S.array()
      .items(S.string().enum(['LoadTopics', 'LongWaiting', 'ExtensionHours']))
      .examples([[]]),
  )
  .prop('operator', S.ref('DataCodeModel').examples([{ dataCode: 5, dataText: 'דן' }]))
  .prop('addOrRemoveStation', S.ref('ToggleModel').description('1 = Remove, 2 = Add').examples(['2']))
  .prop('driverName', S.string().examples(['']))
  .prop('licenseNum', S.string().examples(['53109603']))
  .prop('eventDate', dateStringSchema().examples(['24/07/2024']))
  .prop('eventHour', hourStringSchema().examples(['19:02']))
  .prop('fromHour', hourStringSchema().examples(['18:55']))
  .prop('toHour', hourStringSchema().examples(['19:10']))
  .prop('fillByMakatOrAddress', S.ref('ToggleModel').description('1 = Makat Station, 2 = Line Number').examples(['2']))
  .prop('makatStation', S.string().examples(['']))
  .prop('lineNumberText', S.string().examples(['70']))
  .prop('lineNumberFromList', S.ref('DataCodeModel').examples([{ dataText: '' }]))
  .prop('direction', S.ref('DataCodeModel').examples([{ dataCode: 2, dataText: 'רמת גן-תל אביב יפו' }]))
  .prop('raisingStation', S.ref('DataCodeModel').examples([{ dataCode: 21470, dataText: 'דרך זבוטינסקי/רשי' }]))
  .prop(
    'applyContent',
    S.string()
      .minLength(10)
      .maxLength(1000)
      .examples([
        'שני אוטובוסים מקו 70 לא עצרו לי באותו יום בזה אחר זה. רשמתי לעצמי תזכורת להתלונן במועד מאוחר יותר, ורק עכשיו התפנתי לכך ולפיכך התלונה המאוחרת.',
      ]),
  )
  .prop('busDirectionFrom', S.string().examples(['הבית ברחוב ארניה רמת גן']))
  .prop('busDirectionTo', S.string().examples(['תל אביב']))
  .prop('raisingStationCity', S.ref('DataCodeModel').examples([{ dataText: '' }]))
  .prop('destinationStationCity', S.ref('DataCodeModel').examples([{ dataText: '' }]))
  .prop('raisingStationAddress', S.string().examples(['']))
  .prop('cityId', S.string().examples(['8600']))
  .prop('cityName', S.string().examples(['רמת גן']))
  .prop('originCityCode', S.string().examples(['8600']))
  .prop('originCityName', S.string().examples(['רמת גן']))
  .prop('destinationCityCode', S.string().examples(['5000']))
  .prop('destinationCityText', S.string().examples(['תל אביב יפו']))
  .prop('directionCode', S.string().examples(['2']))
  .prop('stationName', S.string().examples(['דרך זבוטינסקי/רשי']))
  .prop('lineCode', S.string().examples(['20070']))
  .prop('firstDeclaration', S.boolean().examples([false]))
  .prop('secondDeclaration', S.boolean().examples([false]));

export const trainSchema = S.object()
  .id('TrainSchema')
  .prop('trainType', S.ref('ToggleModel').description('1 = Israel Train, 2 = Light Train').examples(['1']))
  .prop('eventDate', dateStringSchema().examples(['']))
  .prop('eventHour', hourStringSchema().examples(['']))
  .prop('startStation', S.ref('DataCodeModel').examples([{ dataText: '' }]))
  .prop('destinationStation', S.ref('DataCodeModel').examples([{ dataText: '' }]))
  .prop('number', S.string().examples(['']))
  .prop('applyContent', S.string().minLength(10).maxLength(1000).examples(['']));

export const taxiSchema = S.object()
  .id('TaxiSchema')
  .prop('eventDetails', S.string().examples(['']))
  .prop('invoice', S.string().examples(['']))
  .prop('evidence', S.string().examples(['']))
  .prop('otherFactors', S.string().examples(['']))
  .prop('taxiType', S.ref('ToggleModel').description('1 = Taxi, 2 = Service Taxi').examples(['2']))
  .prop('driverName', S.string().examples(['']))
  .prop('licenseNum', S.string().examples(['']))
  .prop('cap', S.string().examples(['']))
  .prop('eventDate', dateStringSchema().examples(['']))
  .prop('eventHour', hourStringSchema().examples(['']))
  .prop('eventLocation', S.string().examples(['']))
  .prop('firstDeclaration', S.boolean().examples([false]))
  .prop('secondDeclaration', S.boolean().examples([false]))
  .prop('applyContent', S.string().minLength(10).maxLength(1000).examples(['']));

export const documentsList = S.array()
  .id('DocumentsList')
  .items(
    S.object()
      .prop('attachmentName', S.string().pattern(fileType).examples(['']))
      .prop('data', S.string().maxLength(5120).examples([''])),
  );

export const complaintFormSchema = S.id('ComplaintFormSchema').anyOf([
  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('title', S.string())
    .prop('requestSubject', S.ref('RequestSubjectSchema'))
    .prop('busAndOther', S.ref('BusAndOtherSchema'))
    .prop('documentsList', S.ref('DocumentsList')),

  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('title', S.string())
    .prop('requestSubject', S.ref('RequestSubjectSchema'))
    .prop('train', S.ref('TrainSchema'))
    .prop('documentsList', S.ref('DocumentsList')),

  S.object()
    .prop('personalDetails', S.ref('PersonalDetailsSchema'))
    .prop('title', S.string())
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
      .prop('data', S.anyOf([S.object(), S.string()]).description('Response data from the government forms system'))
      .prop('referenceNumber', S.string().description('Generated reference number')),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};
