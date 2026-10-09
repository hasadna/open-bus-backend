import { CreateQueueCommand, GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';

export const sqs = new SQSClient();

let queuesPromise;

async function createComplaintQueues() {
  const { QueueUrl: dlqUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'complaints-dlq' }));

  const {
    Attributes: { QueueArn: dlqArn },
  } = await sqs.send(new GetQueueAttributesCommand({ QueueUrl: dlqUrl, AttributeNames: ['QueueArn'] }));

  const { QueueUrl: queueUrl } = await sqs.send(
    new CreateQueueCommand({
      QueueName: 'complaints',
      Attributes: { RedrivePolicy: JSON.stringify({ deadLetterTargetArn: dlqArn, maxReceiveCount: 5 }) },
    }),
  );

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
