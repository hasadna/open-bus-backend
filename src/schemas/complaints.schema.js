import { optionalObject, Type } from './index.js';

const numberOnly = /^[0-9]+$/u;
const hebOnly = /^[א-ת-\s'"()]+/u;
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u;
const fileType = /^.*\.(?<type>doc|docx|jpeg|jpg|pdf|gif|tiff|png)$/giu;

const mobileSchema = () => Type.String({ pattern: mobileOnly.source });
const dateStringSchema = () => Type.String({ format: 'date-time' });
const hourStringSchema = (examples) => Type.String({ pattern: '[012][0-9]:[012][0-9]', ...(examples && { examples }) });

export const personalDetailsSchema = optionalObject(
  {
    firstName: Type.String({ pattern: hebOnly.source, minLength: 1, maxLength: 100, examples: ['פרטי'] }),
    lastName: Type.String({ pattern: hebOnly.source, minLength: 1, maxLength: 100, examples: ['משפחה'] }),
    iDNum: Type.String({ minLength: 9, maxLength: 9, pattern: numberOnly.source, examples: ['123456782'] }),
    email: Type.String({ format: 'email', examples: ['email@gmail.com'] }),
    mobile: Type.String({ ...mobileSchema(), examples: ['050-2345678'] }),
  },
  { $id: 'PersonalDetailsSchema' },
);

export const requestSubjectSchema = optionalObject(
  { applySubject: Type.Ref('DataCodeModel'), applyType: Type.Ref('DataCodeModel') },
  { $id: 'RequestSubjectSchema' },
);

export const busAndOtherSchema = optionalObject(
  {
    ravKav: Type.Boolean(),
    singleTrip: Type.Boolean(),
    ravKavNumber: Type.String({ minLength: 9, maxLength: 11, pattern: numberOnly.source, examples: ['123456789'] }),
    reportdate: dateStringSchema(),
    reportTime: hourStringSchema(),
    addingFrequencyReason: Type.Array(Type.String({ enum: ['LoadTopics', 'LongWaiting', 'ExtensionHours'] })),
    operator: Type.Ref('DataCodeModel'),
    addOrRemoveStation: Type.Ref('ToggleModel', { description: '1 = Remove, 2 = Add' }),
    driverName: Type.String(),
    licenseNum: Type.String(),
    eventDate: dateStringSchema(),
    eventHour: hourStringSchema(['08:00']),
    fromHour: hourStringSchema(['07:00']),
    toHour: hourStringSchema(['09:00']),
    fillByMakatOrAddress: Type.Ref('ToggleModel', { description: '1 = Makat Station, 2 = Line Number' }),
    makatStation: Type.String(),
    lineNumberText: Type.String(),
    lineNumberFromList: Type.Ref('DataCodeModel'),
    direction: Type.Ref('DataCodeModel'),
    raisingStation: Type.Ref('DataCodeModel'),
    applyContent: Type.String({ minLength: 10, maxLength: 1000 }),
    busDirectionFrom: Type.String(),
    busDirectionTo: Type.String(),
    raisingStationCity: Type.Ref('DataCodeModel'),
    destinationStationCity: Type.Ref('DataCodeModel'),
    raisingStationAddress: Type.String(),
    cityId: Type.String(),
    cityName: Type.String(),
    originCityCode: Type.String(),
    originCityName: Type.String(),
    destinationCityCode: Type.String(),
    destinationCityText: Type.String(),
    directionCode: Type.String(),
    stationName: Type.String(),
    lineCode: Type.String(),
    firstDeclaration: Type.Boolean(),
    secondDeclaration: Type.Boolean(),
  },
  { $id: 'BusAndOtherSchema' },
);

export const trainSchema = optionalObject(
  {
    trainType: Type.Ref('ToggleModel', { description: '1 = Israel Train, 2 = Light Train' }),
    eventDate: dateStringSchema(),
    eventHour: hourStringSchema(['08:00']),
    startStation: Type.Ref('DataCodeModel'),
    destinationStation: Type.Ref('DataCodeModel'),
    number: Type.String(),
    applyContent: Type.String({ minLength: 10, maxLength: 1000 }),
  },
  { $id: 'TrainSchema' },
);

export const taxiSchema = optionalObject(
  {
    eventDetails: Type.String(),
    invoice: Type.String(),
    evidence: Type.String(),
    otherFactors: Type.String(),
    taxiType: Type.Ref('ToggleModel', { description: '1 = Taxi, 2 = Service Taxi' }),
    driverName: Type.String(),
    licenseNum: Type.String(),
    cap: Type.String(),
    eventDate: dateStringSchema(),
    eventHour: hourStringSchema(['08:00']),
    eventLocation: Type.String(),
    firstDeclaration: Type.Boolean(),
    secondDeclaration: Type.Boolean(),
    applyContent: Type.String({ minLength: 10, maxLength: 1000 }),
  },
  { $id: 'TaxiSchema' },
);

export const documentsList = Type.Array(
  optionalObject({
    attachmentName: Type.String({ pattern: fileType.source, examples: ['file.png'] }),
    data: Type.String({ maxLength: 5120 }),
  }),
  { $id: 'DocumentsList' },
);

const complaintVariant = (transport) =>
  optionalObject({
    personalDetails: Type.Ref('PersonalDetailsSchema'),
    title: Type.String(),
    requestSubject: Type.Ref('RequestSubjectSchema'),
    [transport]: Type.Ref(`${transport[0].toUpperCase()}${transport.slice(1)}Schema`),
    documentsList: Type.Ref('DocumentsList'),
  });

export const complaintFormSchema = Type.Union([complaintVariant('busAndOther'), complaintVariant('train'), complaintVariant('taxi')], {
  $id: 'ComplaintFormSchema',
});

/**
 * Send complaint endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const sendComplaintSchema = {
  tags: ['Complaints'],
  summary: 'Send a complaint',
  description: 'Complaint submission is not available yet',
  body: optionalObject({ data: Type.Ref('ComplaintFormSchema') }),
  response: {
    400: Type.Ref('ErrorResponseModel'),
    501: Type.Ref('ErrorResponseModel'),
  },
};
