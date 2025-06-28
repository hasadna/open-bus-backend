import {
  getCities,
  getLinesByLine,
  getLinesByStation,
  getNotRealNumbers,
  getPniya,
  getStationByLine,
  getSubjects,
  getTime,
  getTrainStations,
} from '../controllers/gov.controller.js';
import {
  getCitiesSchema,
  // getLinesByLineSchema,
  // getLinesByStationSchema,
  // getNotRealNumbersSchema,
  // getPniyaSchema,
  // getStationByLineSchema,
  // getSubjectsSchema,
  getTimeSchema,
  // getTrainStationsSchema,
} from '../schemas/gov.schema.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function govRoutes(fastify) {
  fastify.post('/cities', { schema: getCitiesSchema }, getCities);
  fastify.post('/lines-by-station', {}, getLinesByStation);
  fastify.post('/stations-by-line', {}, getStationByLine);
  fastify.post('/subjects', {}, getSubjects);
  fastify.post('/train-stations', {}, getTrainStations);
  fastify.post('/pniya', {}, getPniya);
  fastify.post('/not-real-numbers', {}, getNotRealNumbers);
  fastify.post('/lines-by-line', {}, getLinesByLine);
  fastify.get('/time', { schema: getTimeSchema }, getTime);
}
