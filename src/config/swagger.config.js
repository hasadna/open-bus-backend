import { healthCheckSchema } from '../schemas/health.schema.js';
import { commonErrorResponse, commonSuccessResponse } from '../schemas/index.js';

/**
 * Swagger configuration
 * @type {import('fastify').FastifySwaggerOptions}
 */
export const swaggerConfig = {
  swagger: {
    info: {
      title: 'Open Bus Backend API',
      version: process.env.npm_package_version || '0.0.0',
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
      { name: 'Complaints', description: 'Complaint submission to government' },
      { name: 'Government Transportation API', description: 'Government transportation data endpoints' },
    ],
    definitions: {
      Error: commonErrorResponse.valueOf(),
      HealthResponse: healthCheckSchema.response['200'].valueOf(),
      SuccessResponse: commonSuccessResponse.valueOf(),
    },
  },
  staticCSP: true,
  transform: ({ schema, url }) => ({ schema, url }),
};

/**
 * Swagger UI configuration
 * @type {import('fastify').FastifySwaggerUiOptions}
 */
export const swaggerUIConfig = {
  routePrefix: '/docs',
  uiConfig: {
    deepLinking: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    operationsSorter: 'alpha',
    tagsSorter: 'alpha',
    tryItOutEnabled: true,
  },
  uiHooks: {
    onRequest(request, reply, next) {
      next();
    },
    preHandler(request, reply, next) {
      next();
    },
  },
  transformStaticCSP: (header) => header,
  staticCSP: true,
};
