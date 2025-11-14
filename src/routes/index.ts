import { FastifyInstance } from 'fastify';

import { createIssue } from '../controllers/issues.controller.js';
import { createIssueSchema } from '../schemas/issues.schema.js';
import { loadModels } from '../schemas/loadModels.js';
import { complaintsRoutes } from './complaints.routes.js';
import { govRoutes } from './gov.routes.js';
import { healthRoutes } from './health.routes.js';
import { issuesRoutes } from './issues.routes.js';

export function registerRoutes(fastify: FastifyInstance) {
  // load Models
  loadModels(fastify);

  // Routes
  fastify.register(healthRoutes);
  fastify.register(issuesRoutes, { prefix: 'issues' });
  fastify.register(complaintsRoutes, { prefix: 'complaints' });
  fastify.register(govRoutes, { prefix: 'gov' });

  // Deprecated route for backward compatibility
  fastify.post('/create-issue', { schema: createIssueSchema }, createIssue);
}
