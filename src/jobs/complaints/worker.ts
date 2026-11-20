import type { Message } from '@aws-sdk/client-sqs';
import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { Consumer } from 'sqs-consumer';
import { Type } from 'typebox';
import { Value } from 'typebox/value';

import { busSchema, complaintFormSchema, sendComplaintSchema, trainSchema } from '../../schemas/complaints.schema.js';
import { dataCodeModel } from '../../schemas/index.js';
import { sendComplaintEmail, sendEmail, simulatorRecipient } from './delivery.js';
import { getComplaintDLQUrl, getComplaintQueueUrl, sqs } from './queue.js';
import { deliveryFailureTemplate } from './templates/deliveryFailure.js';

const models = { DataCodeModel: dataCodeModel, BusSchema: busSchema, TrainSchema: trainSchema, ComplaintFormSchema: complaintFormSchema };
const queuedComplaintSchema = Type.Object({
  pairKey: sendComplaintSchema.headers.properties['pair-key'],
  data: Type.Ref('ComplaintFormSchema'),
  debug: Type.Optional(Type.Boolean()),
});

function parseComplaint(message: Message) {
  const payload: unknown = JSON.parse(message.Body ?? '');
  if (!Value.Check(models, queuedComplaintSchema, payload)) throw new Error('Invalid queued complaint');
  return payload;
}

export async function processComplaintMessage(message: Message, deadLetter: boolean, log: FastifyBaseLogger) {
  if (!message.ReceiptHandle || !message.MessageId) throw new Error('SQS message omitted receipt handle or message ID');
  try {
    const { data, debug = false } = parseComplaint(message);
    if (deadLetter) {
      await sendEmail(debug ? simulatorRecipient : data.email, deliveryFailureTemplate(message.MessageId, data.lang), {
        purpose: 'complaint_failure_notification',
        ...(debug ? { debug: 'true' } : {}),
      });
    } else {
      await sendComplaintEmail(data, debug);
    }
  } catch (error) {
    log.error({ err: error, messageId: message.MessageId, deadLetter }, 'Failed to process complaint');
    if (!deadLetter) throw error;
    // Notification attempts are terminal, including invalid payloads and SES failures.
  }
  return message;
}

function createConsumer(queueUrl: string, deadLetter: boolean, log: FastifyBaseLogger) {
  const consumer = Consumer.create({
    queueUrl,
    sqs,
    batchSize: 1,
    waitTimeSeconds: 20,
    visibilityTimeout: 60,
    pollingWaitTimeMs: 5_000,
    authenticationErrorTimeout: 5_000,
    pollingCompleteWaitTimeMs: 45_000,
    strictReturn: true,
    handleMessage: (message) => processComplaintMessage(message, deadLetter, log),
  });
  for (const event of ['error', 'processing_error', 'timeout_error'] as const) {
    consumer.on(event, (...[error, message]) => {
      log.error({ err: error, messageId: Array.isArray(message) ? undefined : message?.MessageId, deadLetter }, 'Complaint queue worker error');
    });
  }
  consumer.on('waiting_for_polling_to_complete_timeout_exceeded', () => {
    log.error({ deadLetter }, 'Complaint worker shutdown timed out');
  });
  return consumer;
}

// Explicit startup keeps route registration and tests free of background AWS calls.
export async function startComplaintWorkers(fastify: FastifyInstance) {
  const queueUrl = await getComplaintQueueUrl();
  const dlqUrl = await getComplaintDLQUrl();
  const consumers = [createConsumer(queueUrl, false, fastify.log), createConsumer(dlqUrl, true, fastify.log)];
  fastify.addHook('onClose', async () => {
    await Promise.all(
      consumers.map(
        (consumer) =>
          new Promise<void>((resolve) => {
            consumer.once('stopped', () => resolve());
            // Aborting would also cancel acknowledgements for messages already being processed.
            consumer.stop();
          }),
      ),
    );
  });
  for (const consumer of consumers) consumer.start();
  return consumers;
}
