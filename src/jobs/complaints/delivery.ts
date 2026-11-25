import { SESv2Client, SESv2ServiceException, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { setTimeout } from 'node:timers/promises';

import type { ComplaintData } from '../../types.js';
import { complaintTemplate } from './templates/complaint.js';
import { resolveLanguage } from './templates/shared.js';

export const ses = new SESv2Client({ maxAttempts: 1 });
export const simulatorRecipients = {
  success: 'success@simulator.amazonses.com',
  bounce: 'bounce@simulator.amazonses.com',
  complaint: 'complaint@simulator.amazonses.com',
  suppressionList: 'suppressionlist@simulator.amazonses.com',
  outOfOffice: 'ooto@simulator.amazonses.com',
} as const;

export async function sendEmail(
  recipient: string,
  template: { subject: string; html: string; text: string },
  tags: Record<string, string>,
  replyTo?: string,
) {
  const from = process.env.SES_EMAIL;
  const configurationSet = process.env.SES_CONFIGURATION_SET;
  if (!from || !recipient) throw new Error('Complaint email configuration is incomplete');

  const command = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [recipient] },
    ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
    Content: {
      Simple: {
        Subject: { Data: template.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: template.html, Charset: 'UTF-8' }, Text: { Data: template.text, Charset: 'UTF-8' } },
      },
    },
    EmailTags: Object.entries(tags).map(([Name, Value]) => ({ Name, Value })),
    ...(configurationSet ? { ConfigurationSetName: configurationSet } : {}),
  });
  const signal = AbortSignal.timeout(15_000);
  for (let attempt = 1; ; attempt++) {
    signal.throwIfAborted();
    try {
      const { MessageId } = await ses.send(command, { abortSignal: signal });
      if (!MessageId) throw new Error('SES response omitted email ID');
      return MessageId;
    } catch (error) {
      // An uncertain SendEmail outcome may already have produced an email.
      const throttled = error instanceof SESv2ServiceException && ['TooManyRequestsException', 'ThrottlingException'].includes(error.name);
      if (!throttled || attempt === 3) throw error;
      await setTimeout(1_000 * attempt, undefined, { signal });
    }
  }
}

export async function sendComplaintEmail(data: ComplaintData, debug: boolean | 'bounce' = false) {
  const recipient = debug === true ? data.email : debug === 'bounce' ? simulatorRecipients.bounce : process.env.SES_COMPLAINTS_EMAIL;
  if (!recipient) throw new Error('Complaint email configuration is incomplete');
  return sendEmail(
    recipient,
    complaintTemplate(data),
    { purpose: 'complaint', lang: resolveLanguage(data.lang), ...(debug ? { debug: 'true' } : {}) },
    data.email,
  );
}
