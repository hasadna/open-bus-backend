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
    fastify.listen({ port: PORT, host: HOST })
    fastify.log.info(`Swagger documentation available at: http://${HOST}:${PORT}/docs`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
