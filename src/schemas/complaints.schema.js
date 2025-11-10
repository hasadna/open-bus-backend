import { S } from './index.js';

const DataCodeSchema = S.object()
  .prop('dataCode', S.oneOf([S.string(), S.number()]).required())
  .prop('dataText', S.string().required());

const UserSchema = S.object()
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('iDNum', S.string().required())
  .prop('email', S.string().required())
  .prop('mobile', S.string().required());

const ComplaintFormValuesSchema = UserSchema.extend({
  complaintType: DataCodeSchema.required(),
  applyContent: S.string().required(),

  busOperator: DataCodeSchema,
  licenseNum: S.string(),
  eventDate: S.string(),
  lineNumberText: S.string(),
  eventTime: S.string(),
  direction: DataCodeSchema,
  wait: S.array().items(S.string()).maxItems(2).minItems(2),
  raisingStation: DataCodeSchema,
  city: DataCodeSchema,
  raisingStationCity: DataCodeSchema,
  destinationStationCity: DataCodeSchema,
  reportdate: S.string(),
  reportTime: S.string(),
  busDirectionFrom: DataCodeSchema,
  busDirectionTo: DataCodeSchema,
  addOrRemoveStation: S.string(),
  raisingStationAddress: S.string(),
  addFrequencyOverCrowd: S.boolean(),
  addFrequencyLongWait: S.boolean(),
  addFrequencyExtendTime: S.boolean(),
  firstDeclaration: S.boolean(),
  secondDeclaration: S.boolean(),
  ravKavNumber: S.string(),
  addFrequencyReason: S.string(),
});

export { DataCodeSchema, UserSchema, ComplaintFormValuesSchema };

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
