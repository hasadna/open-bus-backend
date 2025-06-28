import Fastify from 'fastify'

import { createIssue } from './src/controllers/issueController.js'
import { sendComplaint } from './src/controllers/complaintController.js'

const fastify = Fastify({
  logger: true,
})

const PORT = process.env.PORT || 3001

// Health check route
fastify.get('/', async () => {
  return { status: 'alive' }
})

// Create issue route
fastify.post('/create-issue', createIssue)

// Complaint route
fastify.post('/complaint', sendComplaint)

// Start the server
const start = async () => {
  try {
    fastify.listen({ port: PORT })
    console.log(`Server is running on port ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
