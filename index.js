import 'dotenv/config';

import { createServer } from './src/config/index.js';
import { globalErrorHandler, notFoundHandler } from './src/middleware/index.js';
import { registerRoutes } from './src/routes/index.js';
import { setupGracefulShutdown } from './src/utils/index.js';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

// Start the server
async function start() {
  try {
    // Create and configure Fastify instance
    const fastify = await createServer();

    // Register global error handlers
    fastify.setErrorHandler(globalErrorHandler);
    fastify.setNotFoundHandler(notFoundHandler);

    // Register all routes
    registerRoutes(fastify);

    // Setup graceful shutdown handlers
    setupGracefulShutdown(fastify);

    // Start listening
    fastify.listen({ host: HOST, port: PORT });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
