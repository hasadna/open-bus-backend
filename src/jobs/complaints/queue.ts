import { GetQueueAttributesCommand, GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';

export const sqs = new SQSClient();

let queuesPromise: Promise<[string, string]> | undefined;

export function clearComplaintQueueCache() {
  queuesPromise = undefined;
}

async function lookupQueue(name: string) {
  const { QueueUrl } = await sqs.send(new GetQueueUrlCommand({ QueueName: name }));
  if (!QueueUrl) throw new Error(`SQS response omitted queue URL for ${name}`);
  return QueueUrl;
}

async function discoverComplaintQueues(): Promise<[string, string]> {
  const [queueUrl, dlqUrl] = await Promise.all([lookupQueue('complaints'), lookupQueue('complaints-dlq')]);
  const [source, dlq] = await Promise.all([
    sqs.send(new GetQueueAttributesCommand({ QueueUrl: queueUrl, AttributeNames: ['RedrivePolicy'] })),
    sqs.send(new GetQueueAttributesCommand({ QueueUrl: dlqUrl, AttributeNames: ['QueueArn'] })),
  ]);
  const dlqArn = dlq.Attributes?.QueueArn;
  if (!dlqArn) throw new Error('SQS response omitted dead-letter queue ARN');

  const redrivePolicy = JSON.parse(source.Attributes?.RedrivePolicy ?? 'null');
  if (redrivePolicy?.deadLetterTargetArn !== dlqArn || ![1, '1'].includes(redrivePolicy.maxReceiveCount)) {
    throw new Error('SQS complaints queue must redrive to complaints-dlq with maxReceiveCount 1');
  }
  return [queueUrl, dlqUrl];
}

function getComplaintQueues() {
  if (!queuesPromise) {
    const pending = discoverComplaintQueues().catch((error) => {
      if (queuesPromise === pending) clearComplaintQueueCache();
      throw error;
    });
    queuesPromise = pending;
  }
  return queuesPromise;
}

export async function getComplaintQueueUrl() {
  const [queueUrl] = await getComplaintQueues();
  return queueUrl;
}

export async function getComplaintDLQUrl() {
  const [, dlqUrl] = await getComplaintQueues();
  return dlqUrl;
}
