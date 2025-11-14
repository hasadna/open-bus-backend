import { FastifyInstance } from 'fastify';

import { healthCheck } from '../controllers/health.controller.js';
import { healthCheckSchema } from '../schemas/health.schema.js';

export function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', { schema: healthCheckSchema }, healthCheck);
}
