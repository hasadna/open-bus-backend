import { CreateQueueCommand, GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';

export const sqs = new SQSClient();

let queuesPromise: Promise<{
  queueUrl: string;
  dlqUrl: string;
}> | null = null;

async function createComplaintQueues() {
  const { QueueUrl: dlqUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'complaints-dlq' }));
  if (!dlqUrl) throw new Error('SQS response omitted dead-letter queue URL');
  const { Attributes } = await sqs.send(new GetQueueAttributesCommand({ QueueUrl: dlqUrl, AttributeNames: ['QueueArn'] }));
  if (!Attributes?.QueueArn) throw new Error('SQS response omitted dead-letter queue ARN');

  const { QueueUrl: queueUrl } = await sqs.send(
    new CreateQueueCommand({
      QueueName: 'complaints',
      Attributes: { RedrivePolicy: JSON.stringify({ deadLetterTargetArn: Attributes?.QueueArn, maxReceiveCount: 5 }) },
    }),
  );
  if (!queueUrl) throw new Error('SQS response omitted complaint queue URL');

  return { queueUrl, dlqUrl };
}

function getComplaintQueues() {
  if (!queuesPromise) {
    queuesPromise = createComplaintQueues().catch((error) => {
      queuesPromise = null;
      throw error;
    });
  }

  return queuesPromise;
}

export async function getComplaintQueueUrl() {
  const { queueUrl } = await getComplaintQueues();
  return queueUrl;
}

export async function getComplaintDLQUrl() {
  const { dlqUrl } = await getComplaintQueues();
  return dlqUrl;
}
