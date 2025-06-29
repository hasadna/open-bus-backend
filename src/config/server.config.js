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
    trustProxy: true,
  });

  // Register Swagger for API documentation
  await fastify.register(import('@fastify/swagger'), swaggerConfig);

  // Register Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), swaggerUIConfig);

  return fastify;
}
