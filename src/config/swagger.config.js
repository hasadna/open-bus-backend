import {
  cityFragment,
  lineFragment,
  notRealNumbersFragment,
  operatorFragment,
  pniyaFragment,
  stationFragment,
  subjectFragment,
} from '../schemas/gov.schema.js';
import { healthCheckSchema } from '../schemas/health.schema.js';
import { commonErrorResponse, commonSuccessResponse } from '../schemas/index.js';

/**
 * Swagger configuration
 * @type {import('@fastify/swagger').SwaggerOptions}
 */
export const swaggerConfig = {
  swagger: {
    info: {
      title: 'Open Bus Backend API',
      version: process.env.npm_package_version || '0.0.0',
    },
    externalDocs: { url: 'https://github.com/hasadna/open-bus-backend', description: 'Github' },
    tags: [
      { name: 'Complaints', description: 'Complaint submission to government' },
      { name: 'Government Transportation API', description: 'Government transportation data endpoints' },
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
    ],
    definitions: {
      // Response schemas
      'Error Response': commonErrorResponse.valueOf(),
      'Health Response': healthCheckSchema.response['200'].valueOf(),
      'Success Response': commonSuccessResponse().valueOf(),

      // Reusable fragments
      City: cityFragment.valueOf(),
      Line: lineFragment.valueOf(),
      'Not Real Numbers (Testing)': notRealNumbersFragment.valueOf(),
      Operator: operatorFragment.valueOf(),
      'Pniya (Vehicles Types)': pniyaFragment.valueOf(),
      Station: stationFragment.valueOf(),
      Subject: subjectFragment.valueOf(),
    },
  },
  staticCSP: true,
  transform: ({ schema, url }) => ({ schema, url }),
};

/**
 * Swagger UI configuration
 * @type {import('@fastify/swagger-ui').FastifySwaggerUiOptions}
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
