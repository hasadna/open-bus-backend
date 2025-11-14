import { FastifyInstance } from 'fastify';

import { cityModel, lineModel, notRealNumberModel, operatorModel, pniyaModel, stationModel, subjectModel } from './gov.schema.js';
import { commonErrorResponse } from './index.js';
import { githubIssueModel, githubMilestoneModel, githubUserModel } from './issues.schema.js';

export function loadModels(fastify: FastifyInstance) {
  fastify.addSchema(commonErrorResponse);
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
