import { createIssueDepractedSchema } from '../schemas/issues.schema.js';
import { complaintsRoutes } from './complaints.routes.js';
import { govRoutes } from './gov.routes.js';
import { healthRoutes } from './health.routes.js';
import { issuesRoutes } from './issues.routes.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function registerRoutes(fastify) {
  fastify.register(healthRoutes);
  fastify.register(issuesRoutes, { prefix: 'issues' });
  fastify.register(complaintsRoutes, { prefix: 'complaints' });
  fastify.register(govRoutes, { prefix: 'gov' });

  // Deprecated route for backward compatibility
  fastify.post('/create-issue', { schema: createIssueDepractedSchema }, (request, reply) => {
    reply.redirect(302, '/issues/create');
  });
}
