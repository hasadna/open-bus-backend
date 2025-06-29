/**
 * Swagger configuration for API documentation
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
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'alive' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' },
          version: { type: 'string', example: '0.0.0' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
        },
      },
    },
  },
  staticCSP: true,
  transform: ({ schema, url }) => ({ schema, url }),
};

/**
 * Swagger UI configuration
 */
export const swaggerUIConfig = {
  routePrefix: '/docs',
  uiConfig: {
    deepLinking: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    operationsSorter: 'alpha',
    showCommonExtensions: true,
    showExtensions: true,
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
