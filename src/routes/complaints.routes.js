import { sendComplaint } from '../controllers/complaints.controller.js';
import { sendComplaintSchema } from '../schemas/complaints.schema.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function complaintsRoutes(fastify) {
  fastify.post('/send', { schema: sendComplaintSchema }, sendComplaint);
}
