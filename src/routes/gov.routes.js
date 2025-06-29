import {
  getCities,
  getLinesByLine,
  getLinesByStation,
  getNotRealNumbers,
  getOperators,
  getPniya,
  getStationByLine,
  getSubjects,
  getTime,
  getTrainStations,
} from '../controllers/gov.controller.js';
import {
  getCitiesSchema,
  // GetLinesByLineSchema,
  // GetLinesByStationSchema,
  getNotRealNumbersSchema,
  getOperatorsSchema,
  getPniyaSchema,
  // GetStationByLineSchema,
  getSubjectsSchema,
  getTimeSchema,
  getTrainStationsSchema,
} from '../schemas/gov.schema.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function govRoutes(fastify) {
  fastify.get('/cities', { schema: getCitiesSchema }, getCities);
  fastify.get('/operators', { schema: getOperatorsSchema }, getOperators);
  fastify.post('/lines-by-station', {}, getLinesByStation);
  fastify.post('/stations-by-line', {}, getStationByLine);
  fastify.get('/subjects', { schema: getSubjectsSchema }, getSubjects);
  fastify.post('/train-stations', { schema: getTrainStationsSchema }, getTrainStations);
  fastify.get('/pniya', { schema: getPniyaSchema }, getPniya);
  fastify.get('/not-real-numbers', { schema: getNotRealNumbersSchema }, getNotRealNumbers);
  fastify.post('/lines-by-line', {}, getLinesByLine);
  fastify.get('/time', { schema: getTimeSchema }, getTime);
}
