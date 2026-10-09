import { Resend } from 'resend';

import { complaintTemplate } from '../templates/complaint.js';
import { resolveLanguage } from '../templates/shared.js';

const COMPLAINTS_EMAIL = 'pniotcrm@mot.gov.il';

export async function sendComplaintEmail(data, idempotencyKey, debug = false) {
  const RESEND_API_KEY = process.env?.RESEND_API_KEY;
  const from = process.env.RESEND_COMPLAINT_FROM;

  if (!RESEND_API_KEY || !from) {
    throw new Error('Complaint email configuration is incomplete');
  }

  const resend = new Resend(RESEND_API_KEY);
  const { data: result, error } = await resend.emails.send(
    {
      from,
      replyTo: data.email,
      to: [debug === true ? data.email : COMPLAINTS_EMAIL],
      ...complaintTemplate(data),
      tags: [
        { name: 'purpose', value: 'complaint' },
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
