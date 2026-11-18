import { loadModels } from '../schemas/loadModels.js';
import { transitRoutes, type TransitOptions } from '../stride/routes.js';
import type { AppServer } from '../types.js';
import { complaintsRoutes } from './complaints.routes.js';
import { healthRoutes } from './health.routes.js';
import { issuesRoutes } from './issues.routes.js';

export function registerRoutes(fastify: AppServer, transit: TransitOptions = {}) {
  // load Models
  loadModels(fastify);

  // Routes
  fastify.register(healthRoutes);
  fastify.register(issuesRoutes, { prefix: 'issues' });
  fastify.register(complaintsRoutes, { prefix: 'complaints' });
  fastify.register(transitRoutes, transit);
  fastify.get('/openapi.json', { schema: { hide: true } }, async () => fastify.swagger());
}
