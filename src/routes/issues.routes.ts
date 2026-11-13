import { createIssue } from '../controllers/issues.controller.js';
import { createIssueSchema } from '../schemas/issues.schema.js';
import type { AppServer } from '../types.js';

export function issuesRoutes(fastify: AppServer) {
  fastify.post('/create', { schema: createIssueSchema }, createIssue);
}
