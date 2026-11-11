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
  let originalEmail;
  let fetchStub;

  beforeEach(async () => {
    originalApiKey = process.env.RESEND_API_KEY;
    originalSecret = process.env.RESEND_WEBHOOK_SECRET;
    originalEmail = process.env.RESEND_EMAIL;
    process.env.RESEND_EMAIL = 'complaints@verified.example';
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
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalSecret === undefined) delete process.env.RESEND_WEBHOOK_SECRET;
    else process.env.RESEND_WEBHOOK_SECRET = originalSecret;
    if (originalEmail === undefined) delete process.env.RESEND_EMAIL;
    else process.env.RESEND_EMAIL = originalEmail;
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
    const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(), payload });
    expect(response.statusCode).to.equal(200);
    expect(response.json()).to.deep.equal({ success: true });
    expect(fetchStub.called).to.equal(false);
  });

  it('rejects a tampered payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/webhook/resend',
      headers: headers(),
      payload: payload.replace('email-123', 'email-456'),
    });
    expect(response.statusCode).to.equal(400);
  });

  it('rejects missing signature headers', async () => {
    const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: { 'content-type': 'application/json' }, payload });
    expect(response.statusCode).to.equal(400);
  });

  it('returns unavailable when the signing secret is missing', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(), payload });
    expect(response.statusCode).to.equal(503);
  });

  const failurePayload = (type = 'email.failed', purpose = 'complaint') =>
    JSON.stringify({ type, data: { email_id: 'email-123', from: 'complaints@verified.example', tags: { purpose } } });

  ['email.failed', 'email.bounced', 'email.suppressed'].forEach((type) => {
    it(`notifies the complaint sender for ${type}`, async () => {
      const body = failurePayload(type);
      const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body });
      expect(response.statusCode).to.equal(200);
      const email = JSON.parse(fetchStub.secondCall.args[1].body);
      expect(email.to).to.deep.equal(['rider@example.com']);
      expect(email.from).to.equal('complaints@verified.example');
      expect(email.html).to.include('lang="he" dir="rtl"');
      expect(email.text).to.include('email-123');
      expect(fetchStub.secondCall.args[1].headers.get('Idempotency-Key')).to.equal('complaint-failure/email-123');
    });
  });

  ['event', 'stored'].forEach((source) => {
    it(`routes debug failures to the test mailbox using the ${source} tag`, async () => {
      delete process.env.RESEND_EMAIL;
      if (source === 'stored')
        fetchStub.onFirstCall().resolves(
          new Response(
            JSON.stringify({
              reply_to: null,
              tags: source === 'stored' ? [{ name: 'debug', value: 'true' }] : [],
            }),
          ),
        );
      const body = JSON.stringify({
        type: 'email.bounced',
        data: { email_id: 'email-123', tags: { purpose: 'complaint', ...(source === 'event' ? { debug: 'true' } : {}) } },
      });
      const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body });
      expect(response.statusCode).to.equal(200);
      expect(fetchStub.callCount).to.equal(source === 'event' ? 1 : 2);
      const email = JSON.parse((source === 'event' ? fetchStub.firstCall : fetchStub.secondCall).args[1].body);
      expect(email.from).to.equal('onboarding@resend.dev');
      expect(email.to).to.deep.equal(['delivered@resend.dev']);
    });
  });

  it('does not notify when a failure notification itself fails', async () => {
    const body = failurePayload('email.failed', 'complaint_failure_notification');
    const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body });
    expect(response.statusCode).to.equal(200);
    expect(fetchStub.called).to.equal(false);
  });

  ['he', 'en', 'ru', 'ar'].forEach((lang) => {
    it(`uses the signed event language ${lang} before the stored language`, async () => {
      fetchStub.onFirstCall().resolves(new Response(JSON.stringify({ reply_to: ['rider@example.com'], tags: [{ name: 'lang', value: 'en' }] })));
      const body = JSON.stringify({ type: 'email.failed', data: { email_id: 'email-123', tags: { purpose: 'complaint', lang } } });
      expect((await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body })).statusCode).to.equal(200);
      expect(JSON.parse(fetchStub.secondCall.args[1].body).html).to.include(`lang="${lang}"`);
    });
  });

  it('uses the retrieved email language when the event has no language', async () => {
    fetchStub.onFirstCall().resolves(new Response(JSON.stringify({ reply_to: ['rider@example.com'], tags: [{ name: 'lang', value: 'ru' }] })));
    const body = failurePayload();
    expect((await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body })).statusCode).to.equal(200);
    expect(JSON.parse(fetchStub.secondCall.args[1].body).html).to.include('lang="ru"');
  });

  it('rejects tampered failure events without sending email', async () => {
    const body = failurePayload();
    const response = await app.inject({
      method: 'POST',
      url: '/webhook/resend',
      headers: headers(body),
      payload: body.replace('complaints', 'attacker'),
    });
    expect(response.statusCode).to.equal(400);
    expect(fetchStub.called).to.equal(false);
  });

  it('returns an error so Resend retries failed notifications', async () => {
    fetchStub.resolves(new Response(JSON.stringify({ message: 'Unavailable', statusCode: 503 }), { status: 503 }));
    const body = failurePayload();
    const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body });
    expect(response.statusCode).to.equal(502);
  });

  it('retries when the original submitter is missing', async () => {
    fetchStub.resolves(new Response(JSON.stringify({ reply_to: null })));
    const body = failurePayload();
    const response = await app.inject({ method: 'POST', url: '/webhook/resend', headers: headers(body), payload: body });
    expect(response.statusCode).to.equal(502);
    expect(fetchStub.callCount).to.equal(1);
  });
});
