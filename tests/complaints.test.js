import { CreateQueueCommand, GetQueueAttributesCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { expect } from 'chai';
import f from 'fastify';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { createHash, randomUUID } from 'node:crypto';
import sinon from 'sinon';

import { clearComplaintStatusCache } from '../src/controllers/complaints.controller.js';
import { registerRoutes } from '../src/routes/index.js';
import { sqs } from '../src/utils/complaintQueue.js';

describe('sendComplaint', () => {
  const uuid = randomUUID();
  const data = {
    title: 'A complaint',
    email: 'rider@example.com',
    firstName: 'אביבה',
    lastName: 'ישראלי',
    id: '123456782',
    passport: '',
    mobile: '050-2345678',
    eventDate: '2026-10-09T08:00:00.000Z',
    eventHour: '08:00',
    details: 'A short complaint',
    transport: { dataText: 'אוטובוס', dataCode: '1' },
    subject: { dataText: 'איחור', dataCode: '2' },
    bus: {},
  };
  let app;
  let sendMessage;
  let fetchStub;

  beforeEach(async () => {
    clearComplaintStatusCache();
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_COMPLAINT_FROM = 'complaints@verified.example';
    const send = sinon.stub(sqs, 'send');
    send
      .withArgs(sinon.match.instanceOf(CreateQueueCommand))
      .callsFake((command) => Promise.resolve({ QueueUrl: command.input.QueueName === 'complaints-dlq' ? 'dlq' : 'complaints' }));
    send.withArgs(sinon.match.instanceOf(GetQueueAttributesCommand)).resolves({ Attributes: { QueueArn: 'arn:dlq' } });
    sendMessage = send.withArgs(sinon.match.instanceOf(SendMessageCommand)).resolves({ MessageId: 'message-123' });
    fetchStub = sinon.stub(globalThis, 'fetch').callsFake(() => Promise.resolve(new Response(JSON.stringify({ id: 'email-123' }))));
    app = f();
    registerRoutes(app);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    sinon.restore();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_COMPLAINT_FROM;
  });

  const submit = (headers = { 'pair-key': uuid }, payload = { data }) => app.inject({ method: 'POST', url: '/complaints/send', headers, payload });

  it('queues, sends, and caches a successful complaint', async () => {
    const first = await submit();
    const second = await submit();
    expect(first.statusCode).to.equal(200);
    expect(second.json()).to.deep.equal(first.json());
    expect(sendMessage.callCount).to.equal(1);
    expect(fetchStub.callCount).to.equal(1);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody)).to.deep.equal({ email: data.email, pairKey: uuid, data });
    expect(JSON.parse(fetchStub.firstCall.args[1].body).from).to.equal('complaints@verified.example');
    expect(JSON.parse(fetchStub.firstCall.args[1].body).reply_to).to.equal(data.email);
    expect(JSON.parse(fetchStub.firstCall.args[1].body).to).to.deep.equal(['pniotcrm@mot.gov.il']);
    expect(fetchStub.firstCall.args[1].headers.get('Idempotency-Key')).to.equal(
      `complaint/${createHash('sha256').update(`${uuid.toLowerCase()}:${data.email}`).digest('hex')}`,
    );
  });

  it('uses different provider keys for different emails with the same pair-key', async () => {
    expect((await submit()).statusCode).to.equal(200);
    expect((await submit(undefined, { data: { ...data, email: 'other@gmail.com' } })).statusCode).to.equal(200);
    expect(fetchStub.secondCall.args[1].headers.get('Idempotency-Key')).not.to.equal(fetchStub.firstCall.args[1].headers.get('Idempotency-Key'));
  });

  it('normalizes identity for duplicate submissions', async () => {
    const first = await submit({ 'pair-key': uuid.toUpperCase() }, { data: { ...data, email: 'Rider@example.com' } });
    expect((await submit()).json()).to.deep.equal(first.json());
    expect(fetchStub.callCount).to.equal(1);
  });

  it('requires a configured sender before contacting Resend', async () => {
    delete process.env.RESEND_COMPLAINT_FROM;
    expect((await submit()).statusCode).to.equal(502);
    expect(fetchStub.called).to.equal(false);
  });

  it('sends debug complaints to the submitter email', async () => {
    expect((await submit(undefined, { data, debug: true })).statusCode).to.equal(200);
    expect(JSON.parse(fetchStub.firstCall.args[1].body).to).to.deep.equal([data.email]);
  });

  ['he', 'en', 'ru', 'ar'].forEach((lang) => {
    it(`accepts ${lang} and tags the Hebrew complaint email`, async () => {
      expect((await submit(undefined, { data: { ...data, lang } })).statusCode).to.equal(200);
      const email = JSON.parse(fetchStub.firstCall.args[1].body);
      expect(email.tags).to.deep.include({ name: 'lang', value: lang });
      expect(email.html).to.include('lang="he" dir="rtl"');
      expect(email.text).to.include('שפת הפונה');
    });
  });

  it('rejects unsupported languages before queueing', async () => {
    expect((await submit(undefined, { data: { ...data, lang: 'fr' } })).statusCode).to.equal(400);
    expect(sendMessage.called).to.equal(false);
  });

  it('rejects invalid keys and complaint emails before running the handler', async () => {
    expect((await submit({})).statusCode).to.equal(400);
    expect((await submit({ 'pair-key': 'invalid' })).statusCode).to.equal(400);
    expect((await submit({ 'idempotency-key': uuid })).statusCode).to.equal(400);
    expect((await submit(undefined, { data: { title: 'No email' } })).statusCode).to.equal(400);
    expect((await submit(undefined, { data: { ...data, email: 'invalid' } })).statusCode).to.equal(400);
    expect(sendMessage.callCount).to.equal(0);
    expect(fetchStub.callCount).to.equal(0);
  });

  it('preserves the frontend submission fields when queueing', async () => {
    const payload = {
      ...data,
      passport: 'AB123456',
      firstName: 'אביבה',
      eventDate: '2026-10-09T08:00:00.000Z',
      eventHour: '23:59',
      fromHour: '08:45',
      toHour: '09:30',
      details: 'A short complaint',
      bus: {
        licenseNumber: '1234567',
        driverName: 'Driver',
        lineNumberText: '42',
        operator: { dataText: 'Operator', dataCode: '3' },
        direction: { dataText: 'Direction', dataCode: '1' },
        raisingStation: { dataText: 'Station', dataCode: '123' },
      },
    };
    expect((await submit(undefined, { data: payload })).statusCode).to.equal(200);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody).data).to.deep.equal(payload);
  });

  for (const transport of ['bus', 'train']) {
    it(`accepts an empty ${transport} submission`, async () => {
      const payload = { ...data, [transport]: {} };
      expect((await submit(undefined, { data: payload })).statusCode).to.equal(200);
    });
  }

  for (const transport of ['bus', 'train']) {
    // eslint-disable-next-line no-loop-func
    it(`accepts empty placeholders alongside a populated ${transport}`, async () => {
      const payload = {
        ...data,
        bus: {},
        train: {},
        [transport]: transport === 'bus' ? { driverName: 'Driver' } : { trainType: '3', trainNumber: '42' },
      };
      expect((await submit(undefined, { data: payload })).statusCode).to.equal(200);
      const queued = JSON.parse(sendMessage.firstCall.args[0].input.MessageBody).data;
      expect(queued[transport]).to.deep.equal(payload[transport]);
      expect(queued).to.deep.equal(payload);
    });
  }

  it('accepts multiple populated transports', async () => {
    const payload = { ...data, bus: { driverName: 'Driver' }, train: { trainNumber: '42' } };
    expect((await submit(undefined, { data: payload })).statusCode).to.equal(200);
    expect(sendMessage.called).to.equal(true);
  });

  it('accepts optional transports and rejects invalid times', async () => {
    const { bus, ...fields } = data;
    expect(bus).to.deep.equal({});
    const responses = await Promise.all(
      [fields, { ...data, train: {} }, { ...data, eventHour: '24:00' }, { ...data, fromHour: '08:60' }].map((payload) =>
        submit(undefined, { data: payload }),
      ),
    );
    expect(responses.map((response) => response.statusCode)).to.deep.equal([200, 200, 400, 400]);
    expect(sendMessage.callCount).to.equal(1);
  });

  it('rejects missing required fields and invalid train values before queueing', async () => {
    const required = [
      'firstName',
      'lastName',
      'id',
      'passport',
      'email',
      'mobile',
      'eventHour',
      'eventDate',
      'details',
      'title',
      'transport',
      'subject',
    ];
    const payloads = required.map((field) => {
      const payload = { ...data };
      delete payload[field];
      return payload;
    });
    payloads.push({ ...data, train: { trainType: '4' } }, { ...data, train: { eventStation: 'other' } });
    const responses = await Promise.all(payloads.map((payload) => submit(undefined, { data: payload })));
    expect(responses.map((response) => response.statusCode)).to.deep.equal(payloads.map(() => 400));
    expect(sendMessage.called).to.equal(false);
    expect(fetchStub.called).to.equal(false);
  });

  it('records Resend failures in the dead-letter queue and caches failure', async () => {
    fetchStub.resolves(new Response(JSON.stringify({ statusCode: 503, message: 'Service unavailable', name: 'application_error' }), { status: 503 }));
    const first = await submit();
    const second = await submit();
    expect(first.statusCode).to.equal(502);
    expect(second.json()).to.deep.equal(first.json());
    expect(sendMessage.callCount).to.equal(2);
    expect(sendMessage.secondCall.args[0].input.QueueUrl).to.equal('dlq');
    expect(fetchStub.callCount).to.equal(1);
  });

  it('returns processing while the first delivery is pending', async () => {
    let finishDelivery;
    let deliveryStarted;
    const started = new Promise((resolve) => {
      deliveryStarted = resolve;
    });
    fetchStub.callsFake(() => {
      deliveryStarted();
      return new Promise((resolve) => {
        finishDelivery = resolve;
      });
    });
    const pending = submit();
    await started;
    const duplicate = await submit();
    expect(duplicate.statusCode).to.equal(202);
    expect(duplicate.json().state).to.equal('PROCESSING');
    finishDelivery(new Response(JSON.stringify({ id: 'email-123' })));
    expect((await pending).statusCode).to.equal(200);
    expect(sendMessage.callCount).to.equal(1);
  });

  it('allows a retry when queueing fails', async () => {
    sendMessage.onFirstCall().rejects(new Error('SQS unavailable'));
    expect((await submit()).statusCode).to.equal(503);
    expect((await submit()).statusCode).to.equal(200);
    expect(sendMessage.callCount).to.equal(2);
    expect(fetchStub.callCount).to.equal(1);
  });
});
