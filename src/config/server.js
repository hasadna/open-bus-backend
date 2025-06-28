import Fastify from 'fastify';
import { swaggerConfig, swaggerUIConfig } from './swagger.js';

/**
 * Create and configure Fastify instance
 * @returns {Promise<import('fastify').FastifyInstance>} Configured Fastify instance
 */
export async function createServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'SYS:standard',
              singleLine: false,
            },
          }
        : undefined,
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            parameters: request.params,
            query: request.query,
            // body: request.body, // Uncomment if you want to log bodies (be careful with sensitive data)
            headers: request.headers,
          };
        },
        res(reply) {
          return {
            statusCode: reply.statusCode,
          };
        },
      },
    },
    trustProxy: true,
    ignoreTrailingSlash: true,
    caseSensitive: false,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 10000, // 10s default
  });

  // Register Swagger for API documentation
  await fastify.register(import('@fastify/swagger'), swaggerConfig);

  // Register Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), swaggerUIConfig);

  return fastify;
}
