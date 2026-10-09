const COMPLAINTS_EMAIL = 'pniotcrm@mot.gov.il';

export async function sendComplaintEmail(data, idempotencyKey) {
  const RESEND_API_KEY = process.env?.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error('Complaint email configuration is incomplete');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      from: data.email,
      to: [COMPLAINTS_EMAIL],
      subject: `Open Bus complaint: ${data.title || idempotencyKey}`,
      text: JSON.stringify(data, null, 2),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected complaint email (${response.status})`);
  }

  const result = await response.json();
  if (!result.id) throw new Error('Resend response omitted email ID');
  return result.id;
}
