// External dependencies
import fs from 'fs';
import nock from 'nock';

import { createServer } from './src/config/index.js';
import { globalErrorHandler, notFoundHandler } from './src/middleware/index.js';
import { registerRoutes } from './src/routes/index.js';
import { setupGracefulShutdown } from './src/utils/index.js';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

nock(/gov.il/u)
  .post(/.*/u, (body) => {
    console.log('Nock intercepted body:', body);
    fs.writeFileSync('nock_body.txt', body);
    return true;
  })
  .reply(200, { success: true, xml: 'NOAMNOAM' });

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
