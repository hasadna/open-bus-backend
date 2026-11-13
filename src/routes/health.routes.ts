import { healthCheck } from '../controllers/health.controller.js';
import { healthCheckSchema } from '../schemas/health.schema.js';
import type { AppServer } from '../types.js';

export function healthRoutes(fastify: AppServer) {
  fastify.get('/', { schema: healthCheckSchema }, healthCheck);
}
