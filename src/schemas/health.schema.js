import { S } from './index.js';

/**
 * Health check endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const healthCheckSchema = {
  tags: ['Health'],
  summary: 'Health check endpoint',
  description: 'Returns the health status of the API',
  response: {
    200: S.object()
      .prop('status', S.string().examples(['alive']))
      .prop('timestamp', S.string().format('date-time').examples(['2025-07-01T13:09:05.570Z']))
      .prop('uptime', S.number().examples([23.1655282]))
      .prop('version', S.string().examples(['2.0.0'])),
    500: S.object().prop('error', S.string()).prop('status', S.string()),
  },
};
