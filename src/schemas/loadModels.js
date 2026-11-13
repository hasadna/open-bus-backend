import { busSchema, complaintFormSchema, documentsList, trainSchema } from './complaints.schema.js';
import { commonErrorResponse, dataCodeModel } from './index.js';
import { githubIssueModel } from './issues.schema.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function loadModels(fastify) {
  fastify.addSchema(commonErrorResponse);
  fastify.addSchema(dataCodeModel);

  fastify.addSchema(busSchema);
  fastify.addSchema(trainSchema);
  fastify.addSchema(documentsList);
  fastify.addSchema(complaintFormSchema);

  fastify.addSchema(githubIssueModel);
}
