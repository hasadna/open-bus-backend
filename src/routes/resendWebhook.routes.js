import { Resend } from 'resend';

import { deliveryFailureTemplate } from '../templates/deliveryFailure.js';
import { resolveLanguage } from '../templates/shared.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export function resendWebhookRoutes(fastify) {
  fastify.removeContentTypeParser('application/json');
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => done(null, body));

  fastify.post('/webhook', async (request, reply) => {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const apiKey = process.env.RESEND_API_KEY;
    if (!webhookSecret || !apiKey) {
      return reply.status(503).send({ error: 'Resend webhook configuration is incomplete' });
    }

    let event;
    try {
      event = new Resend(apiKey).webhooks.verify({
        payload: request.body,
        headers: {
          id: request.headers['svix-id'],
          timestamp: request.headers['svix-timestamp'],
          signature: request.headers['svix-signature'],
        },
        webhookSecret,
      });
    } catch {
      return reply.status(400).send({ error: 'Invalid webhook signature or payload' });
    }

    request.log.info({ eventId: request.headers['svix-id'], type: event.type, emailId: event.data?.email_id }, 'Received Resend webhook');
    const isFailure = ['email.failed', 'email.bounced', 'email.suppressed'].includes(event.type);
    if (!isFailure || event.data?.tags?.purpose !== 'complaint') {
      return reply.send({ success: true });
    }

    const from = 'open-bus@hasadna.org.il';
    if (!from) {
      return reply.status(503).send({ error: 'Complaint failure notification configuration is incomplete' });
    }
    if (!event.data.email_id) {
      return reply.status(400).send({ error: 'Complaint failure event omitted email ID' });
    }

    try {
      const resend = new Resend(apiKey);
      const { data: complaint, error: lookupError } = await resend.emails.get(event.data.email_id);
      if (lookupError) throw new Error(lookupError.message);
      const submitter = complaint?.reply_to?.[0];
      if (!submitter) throw new Error('Complaint email omitted submitter reply-to address');
      const lang = resolveLanguage(event.data.tags?.lang, complaint.tags?.find((tag) => tag.name === 'lang')?.value);
      const { data, error } = await resend.emails.send(
        {
          from,
          to: [submitter],
          ...deliveryFailureTemplate(event.data.email_id, lang),
          tags: [{ name: 'purpose', value: 'complaint_failure_notification' }],
        },
        { idempotencyKey: `complaint-failure/${event.data.email_id}` },
      );
      if (error) throw new Error(error.message);
      if (!data?.id) throw new Error('Resend response omitted notification email ID');
    } catch (error) {
      request.log.error({ err: error, emailId: event.data.email_id }, 'Failed to send complaint failure notification');
      return reply.status(502).send({ error: 'Unable to send complaint failure notification' });
    }
    return reply.send({ success: true });
  });
}
