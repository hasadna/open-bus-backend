import Fastify from 'fastify'

import { createIssue, createIssueSchema } from './src/controllers/issueController.js'
import { sendComplaint, sendComplaintSchema } from './src/controllers/complaintController.js'
import { healthCheck, healthCheckSchema } from './src/controllers/healthController.js'

const fastify = Fastify({
  logger: true,
})

const PORT = process.env.PORT || 3001

// Swagger configuration
await fastify.register(import('@fastify/swagger'), {
  swagger: {
    info: {
      title: 'Open Bus Backend API',
      description: 'API for creating GitHub issues and sending complaints',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    host: `localhost:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Issues', description: 'GitHub issue management' },
      { name: 'Complaints', description: 'Complaint submission' },
    ],
  },
})

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next()
    },
    preHandler: function (request, reply, next) {
      next()
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
})

// Health check route
fastify.get('/', healthCheckSchema, healthCheck)

// Create issue route
fastify.post('/create-issue', createIssueSchema, createIssue)

// Complaint route
fastify.post('/complaint', sendComplaintSchema, sendComplaint)

// Start the server
function start() {
  try {
    fastify.listen({ port: PORT })
    console.log(`Server is running on port ${PORT}`)
    console.log(`Swagger documentation available at: http://localhost:${PORT}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
