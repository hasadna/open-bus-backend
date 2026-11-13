import type { SwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    info: {
      title: 'Open Bus Backend API',
      version: process.env.npm_package_version || '0.0.0',
    },
    externalDocs: { url: 'https://github.com/hasadna/open-bus-backend', description: 'Github' },
    tags: [
      { name: 'Complaints', description: 'Complaint submission to government' },
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
    ],
  },
  transform: ({ schema, url }) => ({ schema, url }),
};

export const swaggerUIConfig: FastifySwaggerUiOptions = {
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
  staticCSP: true,
  transformStaticCSP: (header) => header,
};
