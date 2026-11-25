import type { healthCheckSchema } from '../schemas/health.schema.js';
import type { SchemaReply, SchemaRequest } from '../types.js';

export function healthCheck(
  request: SchemaRequest<typeof healthCheckSchema>,
  reply: SchemaReply<typeof healthCheckSchema>,
  complaintWorkerStartupFailed: boolean,
) {
  try {
    const healthData = {
      status: complaintWorkerStartupFailed ? 'degraded' : 'alive',
      ...(complaintWorkerStartupFailed ? { details: { complaintWorkers: 'startup_failed' as const } } : {}),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.0.0',
    };

    request.log.info({ status: healthData.status }, 'Health check requested');

    reply.status(200).send(healthData);
  } catch (error) {
    request.log.error(error, 'Health check failed');

    reply.status(500).send({
      error: 'Health check failed',
      status: 'unhealthy',
    });
  }
}
