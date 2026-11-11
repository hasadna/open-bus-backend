import { Resend } from 'resend';

import { complaintTemplate } from '../templates/complaint.js';
import { resolveLanguage } from '../templates/shared.js';

export const emailTest = {
  onboarding: 'onboarding@resend.dev',
  // sender email
  delivered: 'delivered@resend.dev',
  // successfully delivered
  bounced: 'bounced@resend.dev',
  // provider rejected your email
  complained: 'complained@resend.dev',
  // marked as spam
  suppressed: 'suppressed@resend.dev',
  // suppressed
};

export async function sendComplaintEmail(data, idempotencyKey, debug = false) {
  const RESEND_API_KEY = process.env?.RESEND_API_KEY;
  const from = debug === true ? emailTest.onboarding : process.env.RESEND_EMAIL;
  const recipient = debug === true ? emailTest.delivered : process.env.RESEND_COMPLAINTS_EMAIL;

  if (!RESEND_API_KEY || !from || !recipient) {
    throw new Error('Complaint email configuration is incomplete');
  }

  const resend = new Resend(RESEND_API_KEY);
  const { data: result, error } = await resend.emails.send(
    {
      from,
      replyTo: data.email,
      to: [recipient],
      ...complaintTemplate(data),
      tags: [
        { name: 'purpose', value: 'complaint' },
        ...(debug === true ? [{ name: 'debug', value: 'true' }] : []),
        { name: 'lang', value: resolveLanguage(data.lang) },
      ],
    },
    { idempotencyKey },
  );

  if (error) {
    throw new Error(`Resend rejected complaint email (${error.statusCode}): ${error.message}`);
  }

  if (!result?.id) throw new Error('Resend response omitted email ID');
  return result.id;
}
