/**
 * Graceful shutdown handler
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {string} signal - The signal that triggered the shutdown
 */
export const gracefulShutdown = async (fastify, signal) => {
  fastify.log.info(`Received ${signal}. Starting graceful shutdown...`)

  try {
    await fastify.close()
    fastify.log.info('Server closed successfully')
    process.exit(0)
  } catch (error) {
    fastify.log.error('Error during graceful shutdown:', error)
    process.exit(1)
  }
}

/**
 * Setup graceful shutdown handlers
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 */
export function setupGracefulShutdown(fastify) {
  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown(fastify, 'SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown(fastify, 'SIGINT'))

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    fastify.log.error('Uncaught Exception:', error)
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    fastify.log.error('Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
  })
}
