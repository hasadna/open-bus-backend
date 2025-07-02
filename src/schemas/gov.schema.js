import { commonErrorResponse, commonSuccessResponse, S } from './index.js';

// --- Reusable field helpers ---
const eventDate = () =>
  S.number().description("Event date in number format (e.g., new Date('2025-05-13T00:00:00').getTime())").default(1747083600000);

const operatorId = () => S.number().description('Operator ID (e.g., 3 for Egede)').default(3);

const stationId = () => S.number().description('Station ID (e.g., 57865)').default(57865);

const operatorLineId = () => S.number().description('Operator line ID (e.g., 83)').default(83);

const officelineId = () => S.number().description('Official line ID (e.g., 12083)').default(12083);

const directions = () => S.number().description('Direction code (e.g., 1)').default(1);

const stationTypeId = () => S.number().description('Station type ID (e.g., 7 for Israel Train)').default(7);

// --- Common reusable fragments ---
export const cityFragment = S.object().prop('DataCode', S.number()).prop('DataText', S.string());

export const lineFragment = S.object()
  .prop('lineCode', S.number())
  .prop('lineText', S.string())
  .prop('operatorId', S.number())
  .prop('eventDate', S.string())
  .prop('directionCode', S.number())
  .prop('directionText', S.string())
  .prop('destinationCity', cityFragment)
  .prop('originCity', cityFragment)
  .prop('message', S.oneOf([S.string(), S.null()]));

export const notRealNumbersFragment = S.object().prop('RowNumber', S.string()).prop('Code', S.string()).prop('IdNum', S.string());

export const operatorFragment = S.object().prop('DataCode', S.number()).prop('DataText', S.string());

export const pniyaFragment = S.object().prop('RowNumber', S.string()).prop('code', S.string()).prop('pniya', S.string());

export const stationFragment = S.object()
  .prop('stationId', S.number())
  .prop('stationName', S.string())
  .prop('direction', S.number())
  .prop('sequence', S.number());

export const subjectFragment = S.object()
  .prop('RowNumber', S.string())
  .prop('code', S.string())
  .prop('vehicles_type_', S.string())
  .prop('vehicles_type_code', S.string())
  .prop('request_subject', S.string())
  .prop('subject_code', S.string());

export const trainStationFragment = S.object()
  .prop('stationId', S.number())
  .prop('stationName', S.string())
  .prop('cityId', S.number())
  .prop('cityName', S.string())
  .prop('stationFullName', S.null());
// --- Endpoint Schemas ---

/**
 * GetLinesByStation endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getLinesByStationSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get bus lines by station',
  description: 'Retrieve bus lines available at a specific station',
  body: S.object()
    .prop('EventDate', eventDate())
    .prop('OperatorId', operatorId())
    .prop('StationId', stationId())
    .required(['EventDate', 'OperatorId', 'StationId']),
  response: {
    200: commonSuccessResponse(S.array().items(lineFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetStationByLine endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getStationByLineSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get stations by line',
  description: 'Retrieve stations for a specific bus line',
  body: S.object()
    .prop('EventDate', eventDate())
    .prop('OperatorId', operatorId())
    .prop('OfficelineId', officelineId())
    .prop('Directions', directions())
    .required(['EventDate', 'OperatorId', 'OfficelineId', 'Directions']),
  response: {
    200: commonSuccessResponse(stationFragment),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetSubjects endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getSubjectsSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get subject types for vehicles',
  description: 'Retrieve subject types for vehicles from the government list',
  response: {
    200: commonSuccessResponse(S.array().items(subjectFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetTrainStations endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getTrainStationsSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get train stations',
  description: 'Retrieve train stations by station type\n7 - Israel Train\n4 - Kfir Light Train\n13 - Tevel Ligh Train',
  body: S.object().prop('StationTypeId', stationTypeId()).required(['StationTypeId']),
  response: {
    200: commonSuccessResponse(S.array().items(trainStationFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetPniya endpoint schema
 * @type {import('fastify').FastifySchema}
 */

export const getPniyaSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get Pniya (Vehicles type)',
  description: 'Retrieve pniya list for vehicles',
  response: {
    200: commonSuccessResponse(S.array().items(pniyaFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetNotRealNumbers endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getNotRealNumbersSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get not real numbers (Testing)',
  description: 'Retrieve not real numbers list for testing',
  response: {
    200: commonSuccessResponse(S.array().items(notRealNumbersFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetLinesByLine endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getLinesByLineSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get lines by line ID',
  description: 'Retrieve bus lines by specific line ID',
  body: S.object()
    .prop('EventDate', eventDate())
    .prop('OperatorId', operatorId())
    .prop('OperatorLineId', operatorLineId())
    .required(['EventDate', 'OperatorId', 'OperatorLineId']),
  response: {
    200: commonSuccessResponse(S.array().items(lineFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetCities endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getCitiesSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get cities',
  description: 'Retrieve list of cities',
  response: {
    200: commonSuccessResponse(S.array().items(cityFragment)),
    400: commonErrorResponse,
    500: commonErrorResponse,
  },
};

/**
 * GetOperators endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getOperatorsSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get operators',
  description: 'Retrieve list of operators',
  response: {
    200: commonSuccessResponse(S.array().items(operatorFragment)),
    500: commonErrorResponse,
  },
};

/**
 * GetTime endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const getTimeSchema = {
  tags: ['Government Transportation API'],
  summary: 'Get current time',
  description: 'Retrieve current server time',
  response: {
    200: commonSuccessResponse(S.object().prop('serverTime', S.string())),
    500: commonErrorResponse,
  },
};
