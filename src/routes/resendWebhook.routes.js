import { Resend } from 'resend';

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

    const from = process.env.RESEND_NOTIFICATION_FROM;
    if (!from) {
      return reply.status(503).send({ error: 'Complaint failure notification configuration is incomplete' });
    }
    if (!event.data.email_id || !event.data.from) {
      return reply.status(400).send({ error: 'Complaint failure event omitted email ID or sender' });
    }

    try {
      const { data, error } = await new Resend(apiKey).emails.send(
        {
          from,
          to: [event.data.from],
          subject: 'Open Bus complaint delivery failed',
          text: `We could not deliver your Open Bus complaint. Please try submitting it again.\n\nComplaint email reference: ${event.data.email_id}`,
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
