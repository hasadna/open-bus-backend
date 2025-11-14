import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { FastifyReply, FastifyRequest } from 'fastify';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    info: {
      title: 'Open Bus Backend API',
      version: process.env.npm_package_version || '0.0.0',
    },
    externalDocs: { url: 'https://github.com/hasadna/open-bus-backend', description: 'Github' },
    tags: [
      { name: 'Complaints', description: 'Complaint submission to government' },
      { name: 'Government Transportation', description: 'Government transportation data endpoints' },
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
    ],
  },
  transform: ({ schema, url }: { schema: any; url: string }) => ({ schema, url }),
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
    onRequest(request: FastifyRequest, reply: FastifyReply, next: () => void) {
      next();
    },
    preHandler(request: FastifyRequest, reply: FastifyReply, next: () => void) {
      next();
    },
  },
  transformStaticCSP: (header: string) => header,
  staticCSP: true,
};
