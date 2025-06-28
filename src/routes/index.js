// Route registration module
import {
  healthCheck,
  createIssue,
  sendComplaint,
  getLinesByStation,
  getStationByLine,
  getSubjects,
  getTrainStations,
  getPniya,
  getNotRealNumbers,
  getLinesByLine,
  getCities,
  getTime,
} from '../controllers/index.js'

import {
  healthCheckSchema,
  createIssueSchema,
  sendComplaintSchema,
  getLinesByStationSchema,
  getStationByLineSchema,
  getSubjectsSchema,
  getTrainStationsSchema,
  getPniyaSchema,
  getNotRealNumbersSchema,
  getLinesByLineSchema,
  getCitiesSchema,
  getTimeSchema,
} from '../schemas/index.js'

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export async function registerRoutes(fastify) {
  // Health check route
  fastify.get('/', { healthCheckSchema }, healthCheck)

  // Issue management routes
  fastify.post('/create-issue', { createIssueSchema }, createIssue)

  // Complaint routes
  fastify.post('/complaint', { sendComplaintSchema }, sendComplaint)

  // Government API routes
  fastify.post('/gov/lines-by-station', { getLinesByStationSchema }, getLinesByStation)
  fastify.post('/gov/stations-by-line', { getStationByLineSchema }, getStationByLine)
  fastify.post('/gov/subjects', { getSubjectsSchema }, getSubjects)
  fastify.post('/gov/train-stations', { getTrainStationsSchema }, getTrainStations)
  fastify.post('/gov/pniya', { getPniyaSchema }, getPniya)
  fastify.post('/gov/not-real-numbers', { getNotRealNumbersSchema }, getNotRealNumbers)
  fastify.post('/gov/lines-by-line', { getLinesByLineSchema }, getLinesByLine)
  fastify.post('/gov/cities', { getCitiesSchema }, getCities)
  fastify.get('/gov/time', { getTimeSchema }, getTime)
}
