import { S } from './index.js';

export const DataCodeSchema = S.object()
  .id('DataCodeSchema')
  .prop('dataCode', S.oneOf([S.string(), S.number()]).required())
  .prop('dataText', S.string().required());

export const UserSchema = S.object()
  .id('UserSchema')
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('iDNum', S.string().required())
  .prop('email', S.string().required())
  .prop('mobile', S.string().required());

export const ComplaintFormValuesSchema = S.object()
  .id('ComplaintFormValuesSchema')
  .extend({ UserSchema })
  .prop('applySubject', S.ref('DataCodeSchema').required())
  .prop('applyType', S.ref('DataCodeSchema').required())
  .prop('applyContent', S.string())
  // Bus And Other
  .prop('busOperator', S.ref('DataCodeSchema'))
  .prop('licenseNum', S.string())
  .prop('eventDate', S.string())
  .prop('lineNumberText', S.string())
  .prop('eventTime', S.string())
  .prop('direction', S.ref('DataCodeSchema'))
  .prop('wait', S.array().items(S.string()).maxItems(2).minItems(2))
  .prop('raisingStation', S.ref('DataCodeSchema'))
  .prop('city', S.ref('DataCodeSchema'))
  .prop('raisingStationCity', S.ref('DataCodeSchema'))
  .prop('destinationStationCity', S.ref('DataCodeSchema'))
  .prop('reportdate', S.string())
  .prop('reportTime', S.string())
  .prop('busDirectionFrom', S.ref('DataCodeSchema'))
  .prop('busDirectionTo', S.ref('DataCodeSchema'))
  .prop('addOrRemoveStation', S.string())
  .prop('raisingStationAddress', S.string())
  .prop('addFrequencyOverCrowd', S.boolean())
  .prop('addFrequencyLongWait', S.boolean())
  .prop('addFrequencyExtendTime', S.boolean())
  .prop('firstDeclaration', S.boolean())
  .prop('secondDeclaration', S.boolean())
  .prop('ravKavNumber', S.string())
  .prop('addFrequencyReason', S.string());
// Train
// .prop('trainType', S.string())
// .prop('eventDate', S.string())
// .prop('eventHour', S.string())
// .prop('startStation', S.ref('DataCodeSchema'))
// .prop('destinationStation', S.ref('DataCodeSchema'))
// .prop('number', S.string())
// Taxi
// .prop('eventDetails', S.string())
// .prop('invoice', S.string())
// .prop('evidence', S.string())
// .prop('otherFactors', S.string())
// .prop('taxiType', S.string())
// .prop('licenseNum', S.string())
// .prop('cap', S.string())
// .prop('eventDate', S.string())
// .prop('eventHour', S.string())
// .prop('eventLocation', S.string())
// .prop('firstDeclaration', S.boolean())
// .prop('secondDeclaration', S.boolean());

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
    .prop('data', S.ref('ComplaintFormValuesSchema')),
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
