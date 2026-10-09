import { expect } from 'chai';
import f from 'fastify';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { createHmac } from 'node:crypto';
import sinon from 'sinon';

import { registerRoutes } from '../src/routes/index.js';

describe('Resend webhook', () => {
  const secret = Buffer.from('webhook-test-signing-secret').toString('base64');
  const payload = '{ "type": "email.delivered", "data": { "email_id": "email-123" } }';
  let app;
  let originalApiKey;
  let originalSecret;
  let originalFrom;
  let fetchStub;

  beforeEach(async () => {
    originalApiKey = process.env.RESEND_API_KEY;
    originalSecret = process.env.RESEND_WEBHOOK_SECRET;
    originalFrom = process.env.RESEND_NOTIFICATION_FROM;
    process.env.RESEND_NOTIFICATION_FROM = 'notifications@example.com';
    fetchStub = sinon
      .stub(globalThis, 'fetch')
      .callsFake((url, options) =>
        Promise.resolve(new Response(JSON.stringify(options.method === 'GET' ? { reply_to: ['rider@example.com'] } : { id: 'notification-123' }))),
      );
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_WEBHOOK_SECRET = `whsec_${secret}`;
    app = f();
    registerRoutes(app);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    sinon.restore();
    if (originalFrom === undefined) delete process.env.RESEND_NOTIFICATION_FROM;
    else process.env.RESEND_NOTIFICATION_FROM = originalFrom;
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalSecret === undefined) delete process.env.RESEND_WEBHOOK_SECRET;
    else process.env.RESEND_WEBHOOK_SECRET = originalSecret;
  });

  const headers = (body = payload) => {
    const id = 'msg_test';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac('sha256', Buffer.from(secret, 'base64')).update(`${id}.${timestamp}.${body}`).digest('base64');
    return {
      'content-type': 'application/json',
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${signature}`,
    };
  };

  it('accepts a signed event using the exact raw payload', async () => {
    const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: headers(), payload });
    expect(response.statusCode).to.equal(200);
    expect(response.json()).to.deep.equal({ success: true });
    expect(fetchStub.called).to.equal(false);
  });

  it('rejects a tampered payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/complaints/webhook',
      headers: headers(),
      payload: payload.replace('email-123', 'email-456'),
    });
    expect(response.statusCode).to.equal(400);
  });

  it('rejects missing signature headers', async () => {
    const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: { 'content-type': 'application/json' }, payload });
    expect(response.statusCode).to.equal(400);
  });

  it('returns unavailable when the signing secret is missing', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: headers(), payload });
    expect(response.statusCode).to.equal(503);
  });

  const failurePayload = (type = 'email.failed', purpose = 'complaint') =>
    JSON.stringify({ type, data: { email_id: 'email-123', from: 'complaints@verified.example', tags: { purpose } } });

  ['email.failed', 'email.bounced', 'email.suppressed'].forEach((type) => {
    it(`notifies the complaint sender for ${type}`, async () => {
      const body = failurePayload(type);
      const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: headers(body), payload: body });
      expect(response.statusCode).to.equal(200);
      const email = JSON.parse(fetchStub.secondCall.args[1].body);
      expect(email.to).to.deep.equal(['rider@example.com']);
      expect(email.from).to.equal('notifications@example.com');
      expect(fetchStub.secondCall.args[1].headers.get('Idempotency-Key')).to.equal('complaint-failure/email-123');
    });
  });

  it('does not notify when a failure notification itself fails', async () => {
    const body = failurePayload('email.failed', 'complaint_failure_notification');
    const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: headers(body), payload: body });
    expect(response.statusCode).to.equal(200);
    expect(fetchStub.called).to.equal(false);
  });

  it('rejects tampered failure events without sending email', async () => {
    const body = failurePayload();
    const response = await app.inject({
      method: 'POST',
      url: '/complaints/webhook',
      headers: headers(body),
      payload: body.replace('complaints', 'attacker'),
    });
    expect(response.statusCode).to.equal(400);
    expect(fetchStub.called).to.equal(false);
  });

  it('returns an error so Resend retries failed notifications', async () => {
    fetchStub.resolves(new Response(JSON.stringify({ message: 'Unavailable', statusCode: 503 }), { status: 503 }));
    const body = failurePayload();
    const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: headers(body), payload: body });
    expect(response.statusCode).to.equal(502);
  });

  it('retries when the original submitter is missing', async () => {
    fetchStub.resolves(new Response(JSON.stringify({ reply_to: null })));
    const body = failurePayload();
    const response = await app.inject({ method: 'POST', url: '/complaints/webhook', headers: headers(body), payload: body });
    expect(response.statusCode).to.equal(502);
    expect(fetchStub.callCount).to.equal(1);
  });
});
