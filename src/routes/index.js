import { loadModels } from '../schemas/loadModels.js';
import { complaintsRoutes } from './complaints.routes.js';
import { healthRoutes } from './health.routes.js';
import { issuesRoutes } from './issues.routes.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function registerRoutes(fastify) {
  // load Models
  loadModels(fastify);

  // Routes
  fastify.register(healthRoutes);
  fastify.register(issuesRoutes, { prefix: 'issues' });
  fastify.register(complaintsRoutes, { prefix: 'complaints' });
}
