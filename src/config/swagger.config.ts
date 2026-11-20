import type { SwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

import { transitSpec } from '../stride/openapi.js';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    info: {
      title: 'Open Bus Backend API',
      version: process.env.npm_package_version || '0.0.0',
    },
    externalDocs: {
      url: 'https://github.com/hasadna/open-bus-backend',
      description: 'Github',
    },
    tags: [
      { name: 'Complaints', description: 'Complaint submission to government' },
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
    ],
  },
  refResolver: {
    buildLocalReference(schema, _baseUri, _fragment, index) {
      return typeof schema.$id === 'string' && schema.$id.length > 0 ? schema.$id : `def-${index}`;
    },
  },
  transform: ({ schema, url }) => ({ schema, url }),
  transformObject: (document) => {
    if (!('openapiObject' in document)) return document.swaggerObject;
    const { openapiObject } = document;
    return {
      ...openapiObject,
      paths: { ...openapiObject.paths, ...transitSpec.paths },
      components: {
        ...openapiObject.components,
        schemas: { ...transitSpec.components?.schemas, ...openapiObject.components?.schemas },
      },
    };
  },
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
