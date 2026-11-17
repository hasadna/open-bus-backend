import { SendMessageCommand } from '@aws-sdk/client-sqs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { LRUCache } from 'lru-cache';

import { complaintTitle } from '../templates/complaint.js';
import type { ComplaintBody, ComplaintHeaders } from '../types.js';
import { getComplaintQueueUrl, sqs } from '../utils/complaintQueue.js';

type QueuedComplaint = { success: true; state: 'PROCESSING'; messageId: string };
const cache = new LRUCache<string, Promise<QueuedComplaint>>({ max: 1000, ttl: 60 * 60 * 1000 });
export function clearComplaintStatusCache() {
  cache.clear();
}

export async function sendComplaint(request: FastifyRequest<{ Body: ComplaintBody; Headers: ComplaintHeaders }>, reply: FastifyReply) {
  const pairKey = request.headers['pair-key'];
  const data = { ...request.body.data, title: complaintTitle(request.body.data) };
  const { email } = data;

  const debug = request.body.debug === true;
  const key = `${pairKey.toLowerCase()}:${email?.trim().toLowerCase()}${debug ? ':debug' : ''}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = Promise.resolve().then(async (): Promise<QueuedComplaint> => {
      const QueueUrl = await getComplaintQueueUrl();
      const result = await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: JSON.stringify({ email, pairKey, data, debug }) }));
      if (!result.MessageId) throw new Error('SQS response omitted message ID');
      return { success: true, state: 'PROCESSING', messageId: result.MessageId };
    });
    cache.set(key, pending);
  }
  try {
    return reply.status(202).send(await pending);
  } catch (error) {
    if (cache.get(key) === pending) cache.delete(key);
    request.log.error({ err: error }, 'Failed to queue complaint');
    const response = { success: false, state: 'FAILED', error: 'Queue error', message: 'Unable to queue complaint' };
    return reply.status(503).send(response);
  }
}
