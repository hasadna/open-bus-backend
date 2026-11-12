import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function globalErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error, 'Unhandled error:');

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation failed',
      message: 'Request validation failed',
      details: error.validation,
    });
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: 'Not found',
      message: 'The requested resource was not found',
    });
  }

  // Handle method not allowed errors
  if (error.statusCode === 405) {
    return reply.status(405).send({
      error: 'Method not allowed',
      message: 'The HTTP method is not allowed for this endpoint',
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;

  reply.status(statusCode);

  return {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
  };
}

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.status(404).send({
    error: 'Not found',
    message: `Route ${request.method}:${request.url} not found`,
  });
}
