import { cityModel, lineModel, notRealNumberModel, operatorModel, pniyaModel, stationModel, subjectModel } from './gov.schema.js';
import { commonErrorResponse } from './index.js';

/**
 * Register all application routes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */

export function loadModels(fastify) {
  fastify.addSchema(commonErrorResponse);
  fastify.addSchema(cityModel);
  fastify.addSchema(lineModel);
  fastify.addSchema(notRealNumberModel);
  fastify.addSchema(operatorModel);
  fastify.addSchema(pniyaModel);
  fastify.addSchema(stationModel);
  fastify.addSchema(subjectModel);
}
