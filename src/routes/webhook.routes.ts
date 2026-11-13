import type { FastifyInstance } from 'fastify';

import { resendWebhook } from '../controllers/webhook.controller.js';

export function webhookRoutes(fastify: FastifyInstance) {
  fastify.removeContentTypeParser('application/json');
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => done(null, body));
  fastify.post('/resend', resendWebhook);
}
