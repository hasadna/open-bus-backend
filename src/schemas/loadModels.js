import {
  busAndOtherDetailsSchema,
  contactIdResultSchema,
  contactIdSchema,
  contactTypeSchema,
  containersViewModelSchema,
  dataCodeSchema,
  documentAttachmentSchema,
  followStatusSchema,
  formDataModelSchema,
  formInformationSchema,
  personalDetailsSchema,
  requestDetailsSchema,
  requestSubjectSchema,
  taxiDetailsSchema,
  trainDetailsSchema,
} from './complaints.schema.js';
import { cityModel, lineModel, notRealNumberModel, operatorModel, pniyaModel, stationModel, subjectModel } from './gov.schema.js';
import { commonErrorResponse } from './index.js';
import { githubIssueModel, githubMilestoneModel, githubUserModel } from './issues.schema.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function loadModels(fastify) {
  fastify.addSchema(commonErrorResponse);

  fastify.addSchema(dataCodeSchema);
  fastify.addSchema(contactIdSchema);
  fastify.addSchema(contactTypeSchema);

  fastify.addSchema(busAndOtherDetailsSchema);
  fastify.addSchema(contactIdResultSchema);
  fastify.addSchema(containersViewModelSchema);
  fastify.addSchema(documentAttachmentSchema);
  fastify.addSchema(followStatusSchema);
  fastify.addSchema(formDataModelSchema);
  fastify.addSchema(formInformationSchema);
  fastify.addSchema(personalDetailsSchema);
  fastify.addSchema(requestDetailsSchema);
  fastify.addSchema(requestSubjectSchema);
  fastify.addSchema(taxiDetailsSchema);
  fastify.addSchema(trainDetailsSchema);

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
