/**
 * Health check handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export function healthCheck(request, reply) {
  try {
    const healthData = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    request.log.info('Health check requested', { status: healthData.status });

    return reply.status(200).send(healthData);
  } catch (error) {
    request.log.error('Health check failed', error);

    return reply.status(500).send({
      error: 'Health check failed',
      status: 'unhealthy',
    });
  }
}
