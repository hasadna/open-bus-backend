import { optionalObject, Type } from './index.js';

const numberOnly = /^[0-9]+$/u;
const hebrewName = /^[א-ת\s'"()-]+$/u;
const multilingualName = /^[א-תA-Za-zء-ي\s'"()-]+$/u;
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u;
const fileType = /^.*\.(?<type>doc|docx|jpeg|jpg|pdf|gif|tiff|png)$/giu;

const mobileSchema = () => Type.String({ pattern: mobileOnly.source });
const dateStringSchema = () => Type.String({ format: 'date-time' });
const hourStringSchema = (examples: string[]) => Type.String({ pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$', examples });

export const busSchema = Type.Object(
  {
    driverName: Type.Optional(Type.String()),
    licenseNumber: Type.Optional(Type.String()),
    lineNumberText: Type.String({ minLength: 1 }),
    operator: Type.Ref('DataCodeModel'),
    direction: Type.Ref('DataCodeModel'),
    raisingStation: Type.Ref('DataCodeModel'),
  },
  { $id: 'BusSchema' },
);

export const trainSchema = Type.Object(
  {
    trainType: Type.Enum(['1', '2', '3'], {
      type: 'string',
      description: '1 = Israel Train, 2 = Jerusalem Light Train, 3 = Gush Dan Light Train (Dankal)',
    }),
    startStation: Type.Ref('DataCodeModel'),
    destinationStation: Type.Ref('DataCodeModel'),
    eventStation: Type.Enum(['start', 'destination'], { type: 'string' }),
    trainNumber: Type.Optional(Type.String()),
  },
  { $id: 'TrainSchema' },
);

export const documentsList = Type.Array(
  optionalObject({
    attachmentName: Type.String({ pattern: fileType.source, examples: ['file.png'] }),
    data: Type.String({ maxLength: 5120 }),
  }),
  { $id: 'DocumentsList' },
);

export const complaintFormSchema = Type.Object(
  {
    firstName: Type.String({ minLength: 1, maxLength: 100, examples: ['פרטי'] }),
    lastName: Type.String({ minLength: 1, maxLength: 100, examples: ['משפחה'] }),
    id: Type.Optional(
      Type.Union([Type.String({ minLength: 9, maxLength: 9, pattern: numberOnly.source }), Type.Literal(''), Type.Null()], {
        examples: ['123456782'],
      }),
    ),
    passport: Type.Optional(Type.Union([Type.String({ maxLength: 10 }), Type.Null()])),
    email: Type.String({ format: 'email', examples: ['email@gmail.com'] }),
    mobile: Type.String({ ...mobileSchema(), examples: ['050-2345678'] }),
    ravkav: Type.Optional(Type.String({ minLength: 11, maxLength: 11, pattern: numberOnly.source })),
    eventHour: hourStringSchema(['08:00']),
    fromHour: Type.Optional(hourStringSchema(['07:00'])),
    toHour: Type.Optional(hourStringSchema(['09:00'])),
    eventDate: dateStringSchema(),
    details: Type.String({ minLength: 5, maxLength: 400, pattern: '^[^&<>]*$' }),
    lang: Type.Optional(
      Type.Enum(['he', 'en', 'ru', 'ar'], { type: 'string', description: 'Preferred user language; defaults to Hebrew (he) when omitted.' }),
    ),
    transport: Type.Ref('DataCodeModel'),
    subject: Type.Ref('DataCodeModel'),
    bus: Type.Optional(Type.Ref('BusSchema')),
    train: Type.Optional(Type.Ref('TrainSchema')),
  },
  {
    $id: 'ComplaintFormSchema',
    anyOf: [
      {
        properties: {
          lang: Type.String({ enum: ['he'] }),
          firstName: Type.String({ pattern: hebrewName.source }),
          lastName: Type.String({ pattern: hebrewName.source }),
        },
      },
      {
        required: ['lang'],
        properties: {
          lang: { not: Type.String({ enum: ['he'] }) },
          firstName: Type.String({ pattern: multilingualName.source }),
          lastName: Type.String({ pattern: multilingualName.source }),
        },
      },
    ],
    oneOf: [
      { required: ['passport'], properties: { passport: { type: 'string', pattern: '\\S' } } },
      { required: ['id'], properties: { id: { type: 'string', minLength: 1 } } },
    ],
    allOf: [{ oneOf: [{ required: ['bus'] }, { required: ['train'] }] }],
  },
);

export const sendComplaintSchema = {
  operationId: 'complaintsSendPost',
  tags: ['Complaints'],
  summary: 'Send a complaint',
  description:
    'Queues a complaint for background SES delivery. Repeat requests with the same UUID, email, and debug flag return the cached acceptance.',
  headers: Type.Object({
    'pair-key': Type.String({ pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' }),
  }),
  body: Type.Object({
    debug: Type.Optional(
      Type.Union([Type.Literal('bounce'), Type.Boolean()], {
        default: false,
        examples: [true, 'bounce'],
        description: 'Use true for the SES success simulator or "bounce" to exercise SQS redrive and the failure notification.',
      }),
    ),
    data: Type.Ref('ComplaintFormSchema'),
  }),
  response: {
    202: Type.Object({ success: Type.Boolean(), state: Type.String(), messageId: Type.String() }),
    400: Type.Ref('ErrorResponseModel'),
    503: Type.Object({ success: Type.Boolean(), state: Type.String(), error: Type.String(), message: Type.String() }),
  },
};
