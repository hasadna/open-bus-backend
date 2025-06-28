/**
 * Swagger configuration for API documentation
 */
export const swaggerConfig = {
  swagger: {
    info: {
      title: 'Open Bus Backend API',
      version: process.env.npm_package_version || '1.0.0',
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
      { name: 'Complaints', description: 'Complaint submission to government' },
      { name: 'Government API', description: 'Government transportation data endpoints' },
    ],
    definitions: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'alive' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' },
          version: { type: 'string' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  staticCSP: true,
  transform: ({ schema, url }) => ({ schema, url }),
}

/**
 * Swagger UI configuration
 */
export const swaggerUIConfig = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next()
    },
    preHandler: function (request, reply, next) {
      next()
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
}
