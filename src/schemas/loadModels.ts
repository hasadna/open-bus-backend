import type { AppServer } from '../types.js';
import { analyticsModels } from './analytics.schema.js';
import {
  busAndOtherSchema,
  complaintFormSchema,
  documentsList,
  personalDetailsSchema,
  requestSubjectSchema,
  taxiSchema,
  trainSchema,
} from './complaints.schema.js';
import { gtfsModels } from './gtfs.schema.js';
import { commonErrorResponse, dataCodeModel, toggle } from './index.js';
import { githubIssueModel } from './issues.schema.js';
import { siriModels } from './siri.schema.js';
import { strideValidationModels } from './stride.schema.js';

export function loadModels(fastify: AppServer) {
  fastify.addSchema(commonErrorResponse);
  fastify.addSchema(dataCodeModel);
  fastify.addSchema(toggle);

  fastify.addSchema(personalDetailsSchema);
  fastify.addSchema(requestSubjectSchema);
  fastify.addSchema(busAndOtherSchema);
  fastify.addSchema(taxiSchema);
  fastify.addSchema(trainSchema);
  fastify.addSchema(documentsList);
  fastify.addSchema(complaintFormSchema);

  fastify.addSchema(githubIssueModel);

  for (const model of [...gtfsModels, ...siriModels, ...analyticsModels, ...strideValidationModels]) {
    fastify.addSchema(model);
  }
}
