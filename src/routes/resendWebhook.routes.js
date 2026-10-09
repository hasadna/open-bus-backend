import { webhook } from '../controllers/webhook.controller.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function resendWebhookRoutes(fastify) {
  fastify.removeContentTypeParser('application/json');
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => done(null, body));
  fastify.post('/webhook', webhook);
}
