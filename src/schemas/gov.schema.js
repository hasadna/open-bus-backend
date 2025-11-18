import { commonSuccessResponse, S } from './index.js';

// --- Reusable field helpers ---
const eventDate = () =>
  S.number().description("Event date in number format (e.g., new Date('2025-05-13T00:00:00').getTime())").default(1747083600000);

const operatorId = () => S.number().description('Operator ID (e.g., 3 for Egede)').default(3);

const stationId = () => S.number().description('Station ID (e.g., 57865)').default(57865);

const operatorLineId = () => S.number().description('Operator line ID (e.g., 83)').default(83);

const officelineId = () => S.number().description('Official line ID (e.g., 12083)').default(12083);

const directions = () => S.number().description('Direction code (e.g., 1)').default(1);

const stationTypeId = () => S.number().description('Station type ID (e.g., 7 for Israel Train)').default(7);

// --- Common reusable Models ---
export const lineModel = S.object()
  .id('LineModel')
  .prop('lineCode', S.number())
  .prop('lineText', S.string())
  .prop('operatorId', S.number())
  .prop('eventDate', S.string())
  .prop('directionCode', S.number())
  .prop('directionText', S.oneOf([S.string(), S.null()]))
  .prop('destinationCity', S.ref('DataCodeModel'))
  .prop('originCity', S.ref('DataCodeModel'))
  .prop('message', S.oneOf([S.string(), S.null()]));

export const notRealNumberModel = S.object()
  .id('NotRealNumberModel')
  .prop('RowNumber', S.string())
  .prop('Code', S.string())
  .prop('IdNum', S.string());

export const pniyaModel = S.object().id('PniyaModel').prop('RowNumber', S.string()).prop('code', S.string()).prop('pniya', S.string());

export const stationModel = S.object()
  .id('StationModel')
  .prop('stationId', S.number())
  .prop('stationName', S.string())
  .prop('cityId', S.number())
  .prop('cityName', S.string())
  .prop('stationFullName', S.oneOf([S.string(), S.null()]));

export const subjectModel = S.object()
  .id('SubjectModel')
  .prop('RowNumber', S.string())
  .prop('code', S.string())
  .prop('vehicles_type_', S.string())
  .prop('vehicles_type_code', S.string())
  .prop('request_subject', S.string())
  .prop('subject_code', S.string());
// --- Endpoint Schemas ---

/**
 * GetLinesByStation endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getLinesByStationSchema = {
  tags: ['Government Transportation'],
  summary: 'Get bus lines by station',
  description: 'Retrieve bus lines available at a specific station',
  body: S.object()
    .prop('EventDate', eventDate())
    .prop('OperatorId', operatorId())
    .prop('StationId', stationId())
    .required(['EventDate', 'OperatorId', 'StationId']),
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('LineModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetStationByLine endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getStationByLineSchema = {
  tags: ['Government Transportation'],
  summary: 'Get stations by line',
  description: 'Retrieve stations for a specific bus line',
  body: S.object()
    .prop('EventDate', eventDate())
    .prop('OperatorId', operatorId())
    .prop('OfficelineId', officelineId())
    .prop('Directions', directions())
    .required(['EventDate', 'OperatorId', 'OfficelineId', 'Directions']),
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('StationModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetSubjects endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getSubjectsSchema = {
  tags: ['Government Transportation'],
  summary: 'Get subject types for vehicles',
  description: 'Retrieve subject types for vehicles from the government list',
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('SubjectModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetTrainStations endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getTrainStationsSchema = {
  tags: ['Government Transportation'],
  summary: 'Get train stations',
  description: 'Retrieve train stations by station type\n7 - Israel Train\n4 - Kfir Light Train\n13 - Tevel Ligh Train',
  body: S.object().prop('StationTypeId', stationTypeId()).required(['StationTypeId']),
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('StationModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetPniya endpoint schema
 * @type {import('fastify').FastifySchema}
 */

export const getPniyaSchema = {
  tags: ['Government Transportation'],
  summary: 'Get Pniya (Vehicles type)',
  description: 'Retrieve pniya list for vehicles',
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('PniyaModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetNotRealNumbers endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getNotRealNumbersSchema = {
  tags: ['Government Transportation'],
  summary: 'Get not real numbers (Testing)',
  description: 'Retrieve not real numbers list for testing',
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('NotRealNumberModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetLinesByLine endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getLinesByLineSchema = {
  tags: ['Government Transportation'],
  summary: 'Get lines by line ID',
  description: 'Retrieve bus lines by specific line ID',
  body: S.object()
    .prop('EventDate', eventDate())
    .prop('OperatorId', operatorId())
    .prop('OperatorLineId', operatorLineId())
    .required(['EventDate', 'OperatorId', 'OperatorLineId']),
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('LineModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetCities endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getCitiesSchema = {
  tags: ['Government Transportation'],
  summary: 'Get cities',
  description: 'Retrieve list of cities',
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('DataCodeModel'))),
    400: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetOperators endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getOperatorsSchema = {
  tags: ['Government Transportation'],
  summary: 'Get operators',
  description: 'Retrieve list of operators',
  response: {
    200: commonSuccessResponse(S.array().items(S.ref('DataCodeModel'))),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * GetTime endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getTimeSchema = {
  tags: ['Government Transportation'],
  summary: 'Get current time',
  description: 'Retrieve current server time',
  response: {
    200: commonSuccessResponse(S.object().prop('serverTime', S.string())),
    500: S.ref('ErrorResponseModel'),
  },
};
