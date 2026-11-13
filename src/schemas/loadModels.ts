import type types = require('../types.js');
import { busSchema, complaintFormSchema, documentsList, trainSchema } from './complaints.schema.js';
import { commonErrorResponse, dataCodeModel } from './index.js';
import { githubIssueModel } from './issues.schema.js';

export function loadModels(fastify: types.AppServer) {
  fastify.addSchema(commonErrorResponse);
  fastify.addSchema(dataCodeModel);

  fastify.addSchema(busSchema);
  fastify.addSchema(trainSchema);
  fastify.addSchema(documentsList);
  fastify.addSchema(complaintFormSchema);

  fastify.addSchema(githubIssueModel);
}
