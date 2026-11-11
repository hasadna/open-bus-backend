import { resendWebhook } from '../controllers/webhook.controller.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function webhookRoutes(fastify) {
  fastify.removeContentTypeParser('application/json');
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => done(null, body));
  fastify.post('/resend', resendWebhook);
}
