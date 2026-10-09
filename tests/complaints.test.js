import { CreateQueueCommand, GetQueueAttributesCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { expect } from 'chai';
import f from 'fastify';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { randomUUID } from 'node:crypto';
import sinon from 'sinon';

import { clearComplaintStatusCache } from '../src/controllers/complaints.controller.js';
import { registerRoutes } from '../src/routes/index.js';
import { sqs } from '../src/utils/complaintQueue.js';

describe('sendComplaint', () => {
  const uuid = randomUUID();
  const data = { title: 'A complaint', email: 'rider@example.com', requestSubject: {}, bus: {} };
  let app;
  let sendMessage;
  let fetchStub;

  beforeEach(async () => {
    clearComplaintStatusCache();
    process.env.RESEND_API_KEY = 'test-key';
    const send = sinon.stub(sqs, 'send');
    send
      .withArgs(sinon.match.instanceOf(CreateQueueCommand))
      .callsFake((command) => Promise.resolve({ QueueUrl: command.input.QueueName === 'complaints-dlq' ? 'dlq' : 'complaints' }));
    send.withArgs(sinon.match.instanceOf(GetQueueAttributesCommand)).resolves({ Attributes: { QueueArn: 'arn:dlq' } });
    sendMessage = send.withArgs(sinon.match.instanceOf(SendMessageCommand)).resolves({ MessageId: 'message-123' });
    fetchStub = sinon.stub(globalThis, 'fetch').resolves({ ok: true, json: () => Promise.resolve({ id: 'email-123' }) });
    app = f();
    registerRoutes(app);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    sinon.restore();
    delete process.env.RESEND_API_KEY;
  });

  const submit = (headers = { 'pair-key': uuid }, payload = { data }) => app.inject({ method: 'POST', url: '/complaints/send', headers, payload });

  it('queues, sends, and caches a successful complaint', async () => {
    const first = await submit();
    const second = await submit();
    expect(first.statusCode).to.equal(200);
    expect(second.json()).to.deep.equal(first.json());
    expect(sendMessage.callCount).to.equal(1);
    expect(fetchStub.callCount).to.equal(1);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody)).to.deep.equal({ idempotencyKey: uuid, data });
    expect(JSON.parse(fetchStub.firstCall.args[1].body).from).to.equal(data.email);
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

  for (const transport of ['train', 'taxi']) {
    it(`accepts an empty ${transport} submission`, async () => {
      const payload = { title: data.title, email: data.email, requestSubject: data.requestSubject, [transport]: {} };
      expect((await submit(undefined, { data: payload })).statusCode).to.equal(200);
    });
  }

  it('rejects missing or multiple transports and invalid times', async () => {
    const { bus, ...fields } = data;
    expect(bus).to.deep.equal({});
    const responses = await Promise.all(
      [fields, { ...data, train: {} }, { ...data, eventHour: '24:00' }, { ...data, fromHour: '08:60' }].map((payload) =>
        submit(undefined, { data: payload }),
      ),
    );
    expect(responses.map((response) => response.statusCode)).to.deep.equal([400, 400, 400, 400]);
    expect(sendMessage.callCount).to.equal(0);
  });

  it('records Resend failures in the dead-letter queue and caches failure', async () => {
    fetchStub.resolves({ ok: false, status: 503 });
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
    finishDelivery({ ok: true, json: () => Promise.resolve({ id: 'email-123' }) });
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
