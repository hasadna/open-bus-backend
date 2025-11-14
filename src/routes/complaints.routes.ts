import { FastifyInstance } from 'fastify';

import { sendComplaint } from '../controllers/complaints.controller.js';
import { sendComplaintSchema } from '../schemas/complaints.schema.js';

export function complaintsRoutes(fastify: FastifyInstance) {
  fastify.post('/send', { schema: sendComplaintSchema }, sendComplaint);
}
