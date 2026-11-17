import { loadModels } from '../schemas/loadModels.js';
import type { AppServer } from '../types.js';
import { complaintsRoutes } from './complaints.routes.js';
import { healthRoutes } from './health.routes.js';
import { issuesRoutes } from './issues.routes.js';

export function registerRoutes(fastify: AppServer) {
  // load Models
  loadModels(fastify);

  // Routes
  fastify.register(healthRoutes);
  fastify.register(issuesRoutes, { prefix: 'issues' });
  fastify.register(complaintsRoutes, { prefix: 'complaints' });
}
