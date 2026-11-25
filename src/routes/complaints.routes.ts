import { rateLimitConfig } from '../config/server.config.js';
import { sendComplaint } from '../controllers/complaints.controller.js';
import { sendComplaintSchema } from '../schemas/complaints.schema.js';
import type { AppServer } from '../types.js';

export function complaintsRoutes(fastify: AppServer) {
  fastify.post('/send', { config: { rateLimit: rateLimitConfig.submission }, schema: sendComplaintSchema }, sendComplaint);
}
