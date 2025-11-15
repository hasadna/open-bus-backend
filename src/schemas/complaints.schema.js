import { S } from './index.js';

export const UserSchema = S.object()
  .id('UserSchema')
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('iDNum', S.string().required())
  .prop('email', S.string().required())
  .prop('mobile', S.string().required())
  .additionalProperties(false);

export const ComplaintFormValuesSchema = S.object()
  .id('ComplaintFormValuesSchema')
  .prop('applySubject', S.ref('DataCodeModel').required())
  .prop('applyType', S.ref('DataCodeModel').required())
  .prop('applyContent', S.string())
  // Bus And Other
  .prop('busOperator', S.ref('DataCodeModel'))
  .prop('licenseNum', S.string())
  .prop('eventDate', S.string())
  .prop('lineNumberText', S.string())
  .prop('eventTime', S.string())
  .prop('direction', S.ref('DataCodeModel'))
  .prop('wait', S.array().items(S.string()).maxItems(2).minItems(2))
  .prop('raisingStation', S.ref('DataCodeModel'))
  .prop('city', S.ref('DataCodeModel'))
  .prop('raisingStationCity', S.ref('DataCodeModel'))
  .prop('destinationStationCity', S.ref('DataCodeModel'))
  .prop('reportdate', S.string())
  .prop('reportTime', S.string())
  .prop('busDirectionFrom', S.ref('DataCodeModel'))
  .prop('busDirectionTo', S.ref('DataCodeModel'))
  .prop('addOrRemoveStation', S.string())
  .prop('raisingStationAddress', S.string())
  .prop('addFrequencyOverCrowd', S.boolean())
  .prop('addFrequencyLongWait', S.boolean())
  .prop('addFrequencyExtendTime', S.boolean())
  .prop('firstDeclaration', S.boolean())
  .prop('secondDeclaration', S.boolean())
  .prop('ravKavNumber', S.string())
  .prop('addFrequencyReason', S.string())
  .extend(UserSchema);

// Train
// .prop('trainType', S.string())
// .prop('eventDate', S.string())
// .prop('eventHour', S.string())
// .prop('startStation', S.ref('DataCodeModel'))
// .prop('destinationStation', S.ref('DataCodeModel'))
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
