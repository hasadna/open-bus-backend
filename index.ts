// External dependencies
import { createServer } from './src/config/index.js';
import { startComplaintWorkers } from './src/jobs/complaints/worker.js';
import { globalErrorHandler, notFoundHandler } from './src/middleware/index.js';
import { registerRoutes } from './src/routes/index.js';
import { setupGracefulShutdown } from './src/utils/gracefulShutdown.js';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3001);

// Start the server
async function start() {
  try {
    // Create and configure Fastify instance
    const fastify = await createServer();

    // Register global error handlers
    fastify.setErrorHandler(globalErrorHandler);
    fastify.setNotFoundHandler(notFoundHandler);

    // Register all routes
    let complaintWorkerStartupFailed = false;
    registerRoutes(fastify, () => complaintWorkerStartupFailed);

    // Setup graceful shutdown handlers
    setupGracefulShutdown(fastify);

    void startComplaintWorkers(fastify).catch((error) => {
      complaintWorkerStartupFailed = true;
      fastify.log.error({ err: error }, 'Failed to start complaint workers');
    });

    // Start listening
    await fastify.listen({ host: HOST, port: PORT });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
