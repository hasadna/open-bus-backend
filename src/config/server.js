import Fastify from 'fastify'
import { swaggerConfig, swaggerUIConfig } from './swagger.js'

/**
 * Create and configure Fastify instance
 * @returns {Promise<import('fastify').FastifyInstance>} Configured Fastify instance
 */
export async function createServer() {
  // Create Fastify instance with enhanced configuration
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,

                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    trustProxy: true,
  })

  // Register Swagger for API documentation
  await fastify.register(import('@fastify/swagger'), swaggerConfig)

  // Register Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), swaggerUIConfig)

  return fastify
}
