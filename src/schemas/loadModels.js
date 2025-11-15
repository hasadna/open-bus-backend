import { busAndOtherSchema, complaintFormSchema, personalDetailsSchema, taxiSchema, trainSchema } from './complaints.schema.js';
import { lineModel, notRealNumberModel, pniyaModel, stationModel, subjectModel } from './gov.schema.js';
import { commonErrorResponse, DataCodeModel } from './index.js';
import { githubIssueModel, githubMilestoneModel, githubUserModel } from './issues.schema.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function loadModels(fastify) {
  fastify.addSchema(commonErrorResponse);
  fastify.addSchema(DataCodeModel);

  fastify.addSchema(personalDetailsSchema);
  fastify.addSchema(busAndOtherSchema);
  fastify.addSchema(taxiSchema);
  fastify.addSchema(trainSchema);
  fastify.addSchema(complaintFormSchema);

  fastify.addSchema(lineModel);
  fastify.addSchema(notRealNumberModel);
  fastify.addSchema(pniyaModel);
  fastify.addSchema(stationModel);
  fastify.addSchema(subjectModel);

  fastify.addSchema(githubUserModel);
  fastify.addSchema(githubMilestoneModel);
  fastify.addSchema(githubIssueModel);
}
