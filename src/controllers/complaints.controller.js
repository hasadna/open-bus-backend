import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { LRUCache } from 'lru-cache';
import { createHash } from 'node:crypto';

import { complaintTitle } from '../templates/complaint.js';
import { sendComplaintEmail } from '../utils/complaintDelivery.js';
import { getComplaintDLQUrl, getComplaintQueueUrl, sqs } from '../utils/complaintQueue.js';

const cache = new LRUCache({ max: 1000, ttl: 24 * 60 * 60 * 1000 });
export function clearComplaintStatusCache() {
  cache.clear();
}

/**
 * Send complaint handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function sendComplaint(request, reply) {
  const pairKey = request.headers['pair-key'];
  const data = { ...request.body.data, title: complaintTitle(request.body.data) };
  const { email } = data;

  const debug = request.body.debug === true;
  const key = `${pairKey.toLowerCase()}:${email?.trim().toLowerCase()}${debug ? ':debug' : ''}`;
  const cached = cache.get(key);
  if (cached) {
    return reply.status(cached.httpStatus).send(cached.response);
  }

  cache.set(key, { httpStatus: 202, response: { success: true, state: 'PROCESSING' } });

  let messageId;
  try {
    const QueueUrl = await getComplaintQueueUrl();
    const result = await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: JSON.stringify({ email, pairKey, data }) }));
    messageId = result.MessageId;
  } catch (error) {
    request.log.error({ err: error }, 'Failed to queue complaint');
    const response = { success: false, state: 'FAILED', error: 'Queue error', message: 'Unable to queue complaint' };
    cache.delete(key);
    return reply.status(503).send(response);
  }

  try {
    const idempotencyKey = `complaint/${createHash('sha256').update(key).digest('hex')}`;
    const emailId = await sendComplaintEmail(data, idempotencyKey, debug);
    const response = { success: true, state: 'SENT', messageId, emailId };
    cache.set(key, { httpStatus: 200, response });
    return reply.status(200).send(response);
  } catch (error) {
    request.log.error({ err: error, messageId }, 'Failed to submit complaint email');
    try {
      const QueueUrl = await getComplaintDLQUrl();
      await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: JSON.stringify({ pairKey, messageId, data }) }));
    } catch (dlqError) {
      request.log.error({ err: dlqError, messageId }, 'Failed to record complaint in dead-letter queue');
    }
    const response = { success: false, state: 'FAILED', messageId };
    cache.delete(key);
    return reply.status(502).send(response);
  }
}
