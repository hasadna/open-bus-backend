import { FastifyInstance } from 'fastify';

import { createIssue } from '../controllers/issues.controller.js';
import { createIssueSchema } from '../schemas/issues.schema.js';

export function issuesRoutes(fastify: FastifyInstance) {
  fastify.post('/create', { schema: createIssueSchema }, createIssue);
}
