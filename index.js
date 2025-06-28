// External dependencies
import { createServer } from './src/config/index.js'
import { registerRoutes } from './src/routes/index.js'
import { globalErrorHandler, notFoundHandler } from './src/middleware/index.js'
import { setupGracefulShutdown } from './src/utils/index.js'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

// Start the server
async function start() {
  try {
    // Create and configure Fastify instance
    const fastify = await createServer()

    // Register global error handlers
    fastify.setErrorHandler(globalErrorHandler)
    fastify.setNotFoundHandler(notFoundHandler)

    // Register all routes
    await registerRoutes(fastify)

    // Setup graceful shutdown handlers
    setupGracefulShutdown(fastify)

    // Start listening
    await fastify.listen({ port: PORT, host: HOST })

    fastify.log.info(`🚀 Server is running on http://${HOST}:${PORT}`)
    fastify.log.info(`📚 Swagger documentation available at: http://${HOST}:${PORT}/docs`)
    fastify.log.info(`🔍 Health check available at: http://${HOST}:${PORT}/`)

    // Log environment information
    fastify.log.info('Environment:', {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT,
      HOST,
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
