/**
 * Global error handler for Fastify
 * @param {import('fastify').FastifyError} error - The error object
 * @param {import('fastify').FastifyRequest} request - The request object
 * @param {import('fastify').FastifyReply} reply - The reply object
 */
export function globalErrorHandler(error, request, reply) {
  request.log.error('Unhandled error:', error);

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation failed',
      message: 'Request validation failed',
      details: error.validation,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: 'Not found',
      message: 'The requested resource was not found',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle method not allowed errors
  if (error.statusCode === 405) {
    return reply.status(405).send({
      error: 'Method not allowed',
      message: 'The HTTP method is not allowed for this endpoint',
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;

  reply.status(statusCode);

  return {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Global not found handler for Fastify
 * @param {import('fastify').FastifyRequest} request - The request object
 * @param {import('fastify').FastifyReply} reply - The reply object
 */
export function notFoundHandler(request, reply) {
  reply.status(404).send({
    error: 'Not found',
    message: `Route ${request.method}:${request.url} not found`,
    timestamp: new Date().toISOString(),
  });
}
