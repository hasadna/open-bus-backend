import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { complaintTemplate } from '../templates/complaint.js';
import { resolveLanguage } from '../templates/shared.js';
import type { ComplaintData } from '../types.js';

export const ses = new SESClient({ maxAttempts: 1 });
export const simulatorRecipients = {
  success: 'success@simulator.amazonses.com',
  bounce: 'bounce@simulator.amazonses.com',
  complaint: 'complaint@simulator.amazonses.com',
  suppressionList: 'suppressionlist@simulator.amazonses.com',
  outOfOffice: 'ooto@simulator.amazonses.com',
} as const;
export const simulatorRecipient = simulatorRecipients.success;

export async function sendEmail(
  recipient: string,
  template: { subject: string; html: string; text: string },
  tags: Record<string, string>,
  replyTo?: string,
) {
  const from = process.env.SES_EMAIL;
  const configurationSet = process.env.SES_CONFIGURATION_SET;
  if (!from || !recipient) throw new Error('Complaint email configuration is incomplete');

  const result = await ses.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [recipient] },
      ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
      Message: {
        Subject: { Data: template.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: template.html, Charset: 'UTF-8' }, Text: { Data: template.text, Charset: 'UTF-8' } },
      },
      Tags: Object.entries(tags).map(([Name, Value]) => ({ Name, Value })),
      ...(configurationSet ? { ConfigurationSetName: configurationSet } : {}),
    }),
    { abortSignal: AbortSignal.timeout(15_000) },
  );
  if (!result.MessageId) throw new Error('SES response omitted email ID');
  return result.MessageId;
}

export async function sendComplaintEmail(data: ComplaintData, debug = false) {
  const recipient = debug ? simulatorRecipient : process.env.SES_COMPLAINTS_EMAIL;
  if (!recipient) throw new Error('Complaint email configuration is incomplete');
  return sendEmail(
    recipient,
    complaintTemplate(data),
    { purpose: 'complaint', lang: resolveLanguage(data.lang), ...(debug ? { debug: 'true' } : {}) },
    data.email,
  );
}
