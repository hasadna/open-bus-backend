import {
  getCities,
  // getLinesByLine,
  // getLinesByStation,
  // getNotRealNumbers,
  // getPniya,
  // getStationByLine,
  // getSubjects,
  getTime,
  // getTrainStations,
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
  // fastify.post('/lines-by-station', { schema: getLinesByStationSchema }, getLinesByStation);
  // fastify.post('/stations-by-line', { schema: getStationByLineSchema }, getStationByLine);
  // fastify.post('/subjects', { schema: getSubjectsSchema }, getSubjects);
  // fastify.post('/train-stations', { schema: getTrainStationsSchema }, getTrainStations);
  // fastify.post('/pniya', { schema: getPniyaSchema }, getPniya);
  // fastify.post('/not-real-numbers', { schema: getNotRealNumbersSchema }, getNotRealNumbers);
  // fastify.post('/lines-by-line', { schema: getLinesByLineSchema }, getLinesByLine);
  fastify.get('/time', { schema: getTimeSchema }, getTime);
}
