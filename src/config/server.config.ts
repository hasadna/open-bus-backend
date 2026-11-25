import cors from '@fastify/cors';
import rateLimit, { type RateLimitOptions } from '@fastify/rate-limit';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import f from 'fastify';

import { swaggerConfig, swaggerUIConfig } from './swagger.config.js';

export const rateLimitConfig = {
  global: { max: 100, timeWindow: '1 minute' },
  submission: { max: 5, timeWindow: '1 minute' },
} as const satisfies { [key: string]: RateLimitOptions };

export async function createServer() {
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
  }).withTypeProvider<TypeBoxTypeProvider>();

  await fastify.register(rateLimit, { global: true, ...rateLimitConfig.global });

  await fastify.register(import('@fastify/swagger'), swaggerConfig);

  await fastify.register(import('@fastify/swagger-ui'), swaggerUIConfig);

  await fastify.register(cors, { origin: '*' });

  return fastify;
}
