import cors from '@fastify/cors';
import f, { FastifyInstance } from 'fastify';

import { swaggerConfig, swaggerUIConfig } from './swagger.config.js';

export async function createServer(): Promise<FastifyInstance> {
  const isDev = process.env.NODE_ENV !== 'production';
  const fastify = f({
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

  // Register Cors Origin requests from all origins
  await fastify.register(cors, { origin: '*' });

  return fastify;
}
