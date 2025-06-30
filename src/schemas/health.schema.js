/**
 * Health check endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const healthCheckSchema = {
  tags: ['Health'],
  summary: 'Health check endpoint',
  description: 'Returns the health status of the API',
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'alive' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        version: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        status: { type: 'string' },
      },
    },
  },
};
