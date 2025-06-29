import fastify2 from 'fastify';

import { swaggerConfig, swaggerUIConfig } from './swagger.config.js';

/**
 * Create and configure Fastify instance
 * @returns {Promise<import('fastify').FastifyInstance>} Configured Fastify instance
 */
export async function createServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const fastify = fastify2({
    caseSensitive: false,
    ignoreTrailingSlash: true,
    logger: {
      level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
      serializers: {
        req(request) {
          return {
            method: request.method,
            parameters: request.params,
            query: request.query,
            url: request.url,
          };
        },
        res(reply) {
          return {
            statusCode: reply.statusCode,
          };
        },
      },
      transport: isDev
        ? {
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              singleLine: false,
              translateTime: 'SYS:standard',
            },
            target: 'pino-pretty',
          }
        : undefined,
    },
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 10000,
    // 10s default
    trustProxy: true,
  });

  // Register Swagger for API documentation
  await fastify.register(import('@fastify/swagger'), swaggerConfig);

  // Register Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), swaggerUIConfig);

  return fastify;
}
