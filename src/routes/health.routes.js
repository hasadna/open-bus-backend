import { healthCheck } from '../controllers/health.controller.js';
import { healthCheckSchema } from '../schemas/health.schema.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function healthRoutes(fastify) {
  fastify.get('/', { schema: healthCheckSchema }, healthCheck);
}
