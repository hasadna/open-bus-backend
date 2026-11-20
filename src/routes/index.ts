import { loadModels } from '../schemas/loadModels.js';
import type { AppServer } from '../types.js';
import { analyticsRoutes } from './analytics.routes.js';
import { complaintsRoutes } from './complaints.routes.js';
import { gtfsRoutes } from './gtfs.routes.js';
import { healthRoutes } from './health.routes.js';
import { issuesRoutes } from './issues.routes.js';
import { siriRoutes } from './siri.routes.js';

export function registerRoutes(fastify: AppServer) {
  // load Models
  loadModels(fastify);

  // Routes
  fastify.register(healthRoutes);
  fastify.register(issuesRoutes, { prefix: 'issues' });
  fastify.register(complaintsRoutes, { prefix: 'complaints' });
  fastify.register(gtfsRoutes);
  fastify.register(siriRoutes);
  fastify.register(analyticsRoutes);
}
