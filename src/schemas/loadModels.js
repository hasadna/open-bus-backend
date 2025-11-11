import { ComplaintFormValuesSchema, DataCodeSchema, sendComplaintSchema, UserSchema } from './complaints.schema.js';
import { cityModel, lineModel, notRealNumberModel, operatorModel, pniyaModel, stationModel, subjectModel } from './gov.schema.js';
import { commonErrorResponse } from './index.js';
import { githubIssueModel, githubMilestoneModel, githubUserModel } from './issues.schema.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function loadModels(fastify) {
  fastify.addSchema(commonErrorResponse);

  fastify.addSchema(ComplaintFormValuesSchema);
  fastify.addSchema(DataCodeSchema);
  fastify.addSchema(sendComplaintSchema);
  fastify.addSchema(UserSchema);

  fastify.addSchema(cityModel);
  fastify.addSchema(lineModel);
  fastify.addSchema(notRealNumberModel);
  fastify.addSchema(operatorModel);
  fastify.addSchema(pniyaModel);
  fastify.addSchema(stationModel);
  fastify.addSchema(subjectModel);

  fastify.addSchema(githubUserModel);
  fastify.addSchema(githubMilestoneModel);
  fastify.addSchema(githubIssueModel);
}
