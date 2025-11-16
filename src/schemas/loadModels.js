import {
  busAndOtherSchema,
  complaintFormSchema,
  documentsList,
  personalDetailsSchema,
  requestSubjectSchema,
  taxiSchema,
  trainSchema,
} from './complaints.schema.js';
import { lineModel, notRealNumberModel, pniyaModel, stationModel, subjectModel } from './gov.schema.js';
import { commonErrorResponse, dataCodeModel } from './index.js';
import { githubIssueModel } from './issues.schema.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function loadModels(fastify) {
  fastify.addSchema(commonErrorResponse);
  fastify.addSchema(dataCodeModel);

  fastify.addSchema(personalDetailsSchema);
  fastify.addSchema(requestSubjectSchema);
  fastify.addSchema(busAndOtherSchema);
  fastify.addSchema(taxiSchema);
  fastify.addSchema(trainSchema);
  fastify.addSchema(documentsList);
  fastify.addSchema(complaintFormSchema);

  fastify.addSchema(lineModel);
  fastify.addSchema(notRealNumberModel);
  fastify.addSchema(pniyaModel);
  fastify.addSchema(stationModel);
  fastify.addSchema(subjectModel);

  fastify.addSchema(githubIssueModel);
}
