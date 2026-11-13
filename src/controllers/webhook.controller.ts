import type { FastifyReply, FastifyRequest } from 'fastify';
import { Resend } from 'resend';

import { deliveryFailureTemplate } from '../templates/deliveryFailure.js';
import { resolveLanguage } from '../templates/shared.js';
import { emailAddress } from '../utils/index.js';

export async function resendWebhook(request: FastifyRequest, reply: FastifyReply) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  if (!webhookSecret || !apiKey) {
    return reply.status(503).send({ error: 'Resend webhook configuration is incomplete' });
  }

  let event;
  try {
    event = new Resend(apiKey).webhooks.verify({
      payload: request.body as string,
      headers: {
        id: request.headers['svix-id'] as string,
        timestamp: request.headers['svix-timestamp'] as string,
        signature: request.headers['svix-signature'] as string,
      },
      webhookSecret,
    });
  } catch {
    return reply.status(400).send({ error: 'Invalid webhook signature or payload' });
  }

  request.log.info(
    { eventId: request.headers['svix-id'], type: event.type, emailId: event.data && 'email_id' in event.data ? event.data.email_id : undefined },
    'Received Resend webhook',
  );
  if (
    (event.type !== 'email.failed' && event.type !== 'email.bounced' && event.type !== 'email.suppressed') ||
    event.data?.tags?.purpose !== 'complaint'
  ) {
    return reply.send({ success: true });
  }

  if (!event.data.email_id) {
    return reply.status(400).send({ error: 'Complaint failure event omitted email ID' });
  }

  try {
    const resend = new Resend(apiKey);
    const eventDebug = event.data.tags?.debug === 'true';
    let complaint;
    if (!eventDebug) {
      const { data, error: lookupError } = await resend.emails.get(event.data.email_id);
      if (lookupError) throw new Error(lookupError.message);
      complaint = data;
    }
    const debug = eventDebug || complaint?.tags?.some((tag) => tag.name === 'debug' && tag.value === 'true');
    const from = debug ? emailAddress.onboarding : process.env.RESEND_EMAIL;
    if (!from) return reply.status(503).send({ error: 'Complaint failure notification configuration is incomplete' });
    const submitter = debug ? emailAddress.delivered : complaint?.reply_to?.[0];
    if (!submitter && complaint?.tags?.some((tag) => tag.name === 'no_reply_to' && tag.value === 'true')) return reply.send({ success: true });
    if (!submitter) throw new Error('Complaint email omitted submitter reply-to address');
    const lang = resolveLanguage(event.data.tags?.lang, complaint?.tags?.find((tag) => tag.name === 'lang')?.value);
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
}
