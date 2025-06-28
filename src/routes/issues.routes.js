import { createIssue } from '../controllers/issues.controller.js';
import { createIssueSchema } from '../schemas/issues.schema.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function issuesRoutes(fastify) {
  fastify.post('/create', { schema: createIssueSchema }, createIssue);
}
