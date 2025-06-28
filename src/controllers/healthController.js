export const healthCheckSchema = {
  tags: ['Health'],
  summary: 'Health check endpoint',
  description: 'Returns the health status of the API',
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'alive' },
      },
    },
  },
}

/**
 * Health check handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function healthCheck(request, reply) {
  return { status: 'alive' }
}
