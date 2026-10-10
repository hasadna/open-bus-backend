import { optionalObject, Type } from './index.js';

const numberOnly = /^[0-9]+$/u;
const hebOnly = /^[א-ת-\s'"()]+/u;
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u;
const fileType = /^.*\.(?<type>doc|docx|jpeg|jpg|pdf|gif|tiff|png)$/giu;

const mobileSchema = () => Type.String({ pattern: mobileOnly.source });
const dateStringSchema = () => Type.String({ format: 'date-time' });
const hourStringSchema = (examples) => Type.String({ pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$', ...(examples && { examples }) });

export const busSchema = optionalObject(
  {
    driverName: Type.String(),
    licenseNumber: Type.String(),
    lineNumberText: Type.String(),
    operator: Type.Ref('DataCodeModel'),
    direction: Type.Ref('DataCodeModel'),
    raisingStation: Type.Ref('DataCodeModel'),
  },
  { $id: 'BusSchema' },
);

export const trainSchema = optionalObject(
  {
    trainType: Type.String({ enum: ['1', '2', '3'], description: '1 = Israel Train, 2 = Jerusalem Light Train, 3 = Gush Dan Light Train (Dankal)' }),
    startStation: Type.Ref('DataCodeModel'),
    destinationStation: Type.Ref('DataCodeModel'),
    eventStation: Type.String({ enum: ['start', 'destination'] }),
    trainNumber: Type.String(),
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
    firstName: Type.String({ pattern: hebOnly.source, minLength: 1, maxLength: 100, examples: ['פרטי'] }),
    lastName: Type.String({ pattern: hebOnly.source, minLength: 1, maxLength: 100, examples: ['משפחה'] }),
    id: Type.String({ minLength: 9, maxLength: 9, pattern: numberOnly.source, examples: ['123456782'] }),
    passport: Type.String(),
    email: Type.String({ format: 'email', examples: ['email@gmail.com'] }),
    mobile: Type.String({ ...mobileSchema(), examples: ['050-2345678'] }),
    eventHour: hourStringSchema(['08:00']),
    fromHour: Type.Optional(hourStringSchema(['07:00'])),
    toHour: Type.Optional(hourStringSchema(['09:00'])),
    eventDate: dateStringSchema(),
    details: Type.String(),
    title: Type.String(),
    lang: Type.Optional(
      Type.String({ enum: ['he', 'en', 'ru', 'ar'], description: 'Preferred user language; defaults to Hebrew (he) when omitted.' }),
    ),
    transport: Type.Ref('DataCodeModel'),
    subject: Type.Ref('DataCodeModel'),
    bus: Type.Optional(Type.Ref('BusSchema')),
    train: Type.Optional(Type.Ref('TrainSchema')),
  },
  { $id: 'ComplaintFormSchema' },
);

/**
 * Send complaint endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const sendComplaintSchema = {
  tags: ['Complaints'],
  summary: 'Send a complaint',
  description: 'Queues a complaint and submits its email to Resend. Repeat requests with the same UUID and email return the cached status.',
  headers: Type.Object({
    'pair-key': Type.String({ pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' }),
  }),
  body: Type.Object({
    debug: Type.Optional(Type.Boolean({ default: false, examples: [true] })),
    data: Type.Intersect([Type.Ref('ComplaintFormSchema'), Type.Object({ email: Type.String({ format: 'email' }) })]),
  }),
  response: {
    200: Type.Object({ success: Type.Boolean(), state: Type.String(), messageId: Type.String(), emailId: Type.String() }),
    202: Type.Object({ success: Type.Boolean(), state: Type.String() }),
    400: Type.Ref('ErrorResponseModel'),
    502: Type.Object({ success: Type.Boolean(), state: Type.String(), messageId: Type.String() }),
    503: Type.Ref('ErrorResponseModel'),
  },
};
