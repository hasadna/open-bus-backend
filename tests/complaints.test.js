import { CreateQueueCommand, GetQueueAttributesCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { expect } from 'chai';
import f from 'fastify';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { createHash, randomUUID } from 'node:crypto';
import sinon from 'sinon';

import { clearComplaintStatusCache } from '../src/controllers/complaints.controller.js';
import { registerRoutes } from '../src/routes/index.js';
import { complaintTitle } from '../src/templates/complaint.js';
import { sqs } from '../src/utils/index.js';

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
    bus: {
      lineNumberText: '1',
      operator: { dataText: 'Operator', dataCode: '3' },
      direction: { dataText: 'Direction', dataCode: '1' },
      raisingStation: { dataText: 'Station', dataCode: '123' },
    },
  };
  const train = {
    trainType: '1',
    startStation: { dataText: 'Start', dataCode: '1' },
    destinationStation: { dataText: 'End', dataCode: '2' },
    eventStation: 'start',
  };
  let app;
  let sendMessage;
  let fetchStub;

  beforeEach(async () => {
    clearComplaintStatusCache();
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_EMAIL = 'complaints@verified.example';
    process.env.RESEND_COMPLAINTS_EMAIL = 'pniotcrm@mot.gov.il';
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
    delete process.env.RESEND_EMAIL;
    delete process.env.RESEND_COMPLAINTS_EMAIL;
  });

  const submit = (headers = { 'pair-key': uuid }, payload = { data }) => app.inject({ method: 'POST', url: '/complaints/send', headers, payload });

  it('queues, sends, and caches a successful complaint', async () => {
    const first = await submit();
    const second = await submit();
    expect(first.statusCode).to.equal(200);
    expect(second.json()).to.deep.equal(first.json());
    expect(sendMessage.callCount).to.equal(1);
    expect(fetchStub.callCount).to.equal(1);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody)).to.deep.equal({
      email: data.email,
      pairKey: uuid,
      data: { ...data, title: complaintTitle(data) },
    });
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

  it('requires a sender for real complaints before contacting Resend', async () => {
    delete process.env.RESEND_EMAIL;
    expect((await submit()).statusCode).to.equal(502);
    expect(fetchStub.called).to.equal(false);
    expect(sendMessage.secondCall.args[0].input.QueueUrl).to.equal('dlq');
  });

  it('uses the Resend test sender for debug complaints when no sender is configured', async () => {
    delete process.env.RESEND_EMAIL;
    expect((await submit(undefined, { data, debug: true })).statusCode).to.equal(200);
    expect(JSON.parse(fetchStub.firstCall.args[1].body).from).to.equal('onboarding@resend.dev');
  });

  it('requires an API key before contacting Resend', async () => {
    delete process.env.RESEND_API_KEY;
    expect((await submit()).statusCode).to.equal(502);
    expect(fetchStub.called).to.equal(false);
  });

  it('sends debug complaints to Resend’s test address', async () => {
    expect((await submit(undefined, { data, debug: true })).statusCode).to.equal(200);
    expect(JSON.parse(fetchStub.firstCall.args[1].body).to).to.deep.equal(['delivered@resend.dev']);
  });

  it('sends a real complaint after a debug submission with the same identity', async () => {
    expect((await submit(undefined, { data, debug: true })).statusCode).to.equal(200);
    expect((await submit(undefined, { data, debug: false })).statusCode).to.equal(200);
    expect((await submit()).statusCode).to.equal(200);
    expect((await submit(undefined, { data, debug: true })).statusCode).to.equal(200);
    expect(sendMessage.callCount).to.equal(2);
    expect(fetchStub.callCount).to.equal(2);
    expect(JSON.parse(fetchStub.firstCall.args[1].body).to).to.deep.equal(['delivered@resend.dev']);
    expect(JSON.parse(fetchStub.secondCall.args[1].body).to).to.deep.equal(['pniotcrm@mot.gov.il']);
    expect(fetchStub.secondCall.args[1].headers.get('Idempotency-Key')).not.to.equal(fetchStub.firstCall.args[1].headers.get('Idempotency-Key'));
  });

  it('preserves an optional Rav-Kav number and rejects invalid values', async () => {
    expect((await submit(undefined, { data: { ...data, ravkav: '12345678901' } })).statusCode).to.equal(200);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody).data.ravkav).to.equal('12345678901');
    const email = JSON.parse(fetchStub.firstCall.args[1].body);
    expect(email.text).to.include('מספר רב-קו: 12345678901');
    expect(email.html).to.include('12345678901');
    const responses = await Promise.all(['123', '123456789012', '1234567890a'].map((ravkav) => submit(undefined, { data: { ...data, ravkav } })));
    expect(responses.map((response) => response.statusCode)).to.deep.equal([400, 400, 400]);
    expect(sendMessage.callCount).to.equal(1);
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

  [undefined, 'he', 'en', 'ru', 'ar'].forEach((lang) => {
    ['firstName', 'lastName'].forEach((field) => {
      it(`validates ${field} for ${lang ?? 'default Hebrew'}`, async () => {
        const multilingual = lang !== undefined && lang !== 'he';
        const cases = [
          ['אביבה', 200],
          ['Anne-Marie', multilingual ? 200 : 400],
          ['محمد', multilingual ? 200 : 400],
          ['אביבה John محمد', multilingual ? 200 : 400],
          ['אביבה 123', 400],
          ['Anne-Marie 123', 400],
          ['محمد 123', 400],
          ['אביבה John محمد 123', 400],
          ['אביבה&', 400],
          ['אביבה<', 400],
          ['אביבה>', 400],
          ['אביבהЖ', 400],
        ];
        await Promise.all(
          cases.map(async ([name, status]) => {
            const response = await submit({ 'pair-key': randomUUID() }, { data: { ...data, lang, [field]: name } });
            expect(response.statusCode, name).to.equal(status);
          }),
        );
      });
    });
  });

  ['&', '<', '>'].forEach((character) => {
    it(`rejects details containing ${character} before queueing`, async () => {
      const response = await submit(undefined, { data: { ...data, details: `Complaint ${character} details` } });
      expect(response.statusCode).to.equal(400);
      expect(sendMessage.called).to.equal(false);
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
      id: undefined,
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
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody).data).to.deep.equal(
      JSON.parse(JSON.stringify({ ...payload, title: complaintTitle(payload) })),
    );
  });

  it('accepts a train with the required fields', async () => {
    const { bus, ...fields } = data;
    expect(bus).to.exist;
    expect((await submit(undefined, { data: { ...fields, train } })).statusCode).to.equal(200);
  });

  it('rejects multiple populated transports', async () => {
    const payload = {
      ...data,
      bus: { ...data.bus, driverName: 'Driver' },
      train: { ...train, trainNumber: '42' },
    };
    expect((await submit(undefined, { data: payload })).statusCode).to.equal(400);
    expect(sendMessage.called).to.equal(false);
  });

  it('requires a transport and rejects invalid times', async () => {
    const { bus, ...fields } = data;
    expect(bus.raisingStation.dataCode).to.equal('123');
    const responses = await Promise.all(
      [fields, { ...fields, train }, { ...data, eventHour: '24:00' }, { ...data, fromHour: '08:60' }].map((payload) =>
        submit(undefined, { data: payload }),
      ),
    );
    expect(responses.map((response) => response.statusCode)).to.deep.equal([400, 200, 400, 400]);
    expect(sendMessage.callCount).to.equal(1);
  });

  it('rejects missing required fields and invalid train values before queueing', async () => {
    const required = ['firstName', 'lastName', 'id', 'mobile', 'eventHour', 'eventDate', 'details', 'transport', 'subject'];
    const payloads = required.map((field) => {
      const payload = { ...data };
      delete payload[field];
      return payload;
    });
    payloads.push(
      { ...data, passport: '', email: '' },
      { ...data, passport: null, email: null },
      ...['lineNumberText', 'operator', 'direction', 'raisingStation'].map((field) => {
        const bus = { ...data.bus };
        delete bus[field];
        return { ...data, bus };
      }),
      { ...data, bus: { ...data.bus, lineNumberText: '' } },
      { ...data, bus: { ...data.bus, operator: {} } },
      { ...data, bus: { ...data.bus, direction: {} } },
      { ...data, bus: {} },
      { ...data, bus: { raisingStation: {} } },
      { ...data, train: { trainType: '4' } },
      { ...data, train: { eventStation: 'other' } },
    );
    const responses = await Promise.all(payloads.map((payload) => submit(undefined, { data: payload })));
    expect(responses.map((response) => response.statusCode)).to.deep.equal(payloads.map(() => 400));
    expect(sendMessage.called).to.equal(false);
    expect(fetchStub.called).to.equal(false);
  });

  for (const field of ['transport', 'subject', 'operator', 'direction', 'raisingStation', 'startStation', 'destinationStation']) {
    it(`requires non-empty text and code for ${field}`, async () => {
      const invalidSelections = [
        {},
        { dataText: 'Selection' },
        { dataCode: '1' },
        { dataText: '', dataCode: '1' },
        { dataText: 'Selection', dataCode: '' },
      ];
      for (const selection of invalidSelections) {
        const payload = { ...data };
        if (['transport', 'subject'].includes(field)) payload[field] = selection;
        else if (['startStation', 'destinationStation'].includes(field)) {
          delete payload.bus;
          payload.train = { ...train, [field]: selection };
        } else payload.bus = { ...data.bus, [field]: selection };
        const response = await submit(undefined, { data: payload });
        expect(response.statusCode, `${field}: ${JSON.stringify(selection)}`).to.equal(400);
      }
      expect(sendMessage.called).to.equal(false);
      expect(fetchStub.called).to.equal(false);
    });
  }

  it('accepts numeric zero as a selection code', async () => {
    const response = await submit(undefined, { data: { ...data, bus: { ...data.bus, raisingStation: { dataText: 'Station', dataCode: 0 } } } });
    expect(response.statusCode).to.equal(200);
    expect(sendMessage.callCount).to.equal(1);
  });

  it('limits complaint details to 400 characters', async () => {
    expect((await submit(undefined, { data: { ...data, details: 'a'.repeat(400) } })).statusCode).to.equal(200);
    expect((await submit(undefined, { data: { ...data, details: 'a'.repeat(401) } })).statusCode).to.equal(400);
  });

  it('limits passports to 10 characters', async () => {
    expect((await submit(undefined, { data: { ...data, id: undefined, passport: '1234567890' } })).statusCode).to.equal(200);
    expect((await submit(undefined, { data: { ...data, id: undefined, passport: '12345678901' } })).statusCode).to.equal(400);
  });

  it('requires email and exactly one identity document', async () => {
    const payloads = [
      { id: undefined, passport: 'AB123456', email: null },
      { email: undefined },
      { email: '' },
      { passport: 'AB123456' },
      { id: undefined },
      { id: '', passport: '' },
    ];
    const responses = await Promise.all(payloads.map((fields) => submit(undefined, { data: { ...data, ...fields } })));
    expect(responses.map((response) => response.statusCode)).to.deep.equal(payloads.map(() => 400));
    expect(fetchStub.called).to.equal(false);
  });

  it('records Resend failures in the dead-letter queue and allows a retry after recovery', async () => {
    fetchStub
      .onFirstCall()
      .resolves(new Response(JSON.stringify({ statusCode: 503, message: 'Service unavailable', name: 'application_error' }), { status: 503 }));
    const first = await submit();
    const second = await submit();
    expect(first.statusCode).to.equal(502);
    expect(second.statusCode).to.equal(200);
    expect(second.json().state).to.equal('SENT');
    expect(sendMessage.callCount).to.equal(3);
    expect(sendMessage.secondCall.args[0].input.QueueUrl).to.equal('dlq');
    expect(fetchStub.callCount).to.equal(2);
    expect(fetchStub.secondCall.args[1].headers.get('Idempotency-Key')).to.equal(fetchStub.firstCall.args[1].headers.get('Idempotency-Key'));
    expect((await submit()).json()).to.deep.equal(second.json());
    expect(fetchStub.callCount).to.equal(2);
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

  it('retries after a queue failure and caches the recovered success', async () => {
    sendMessage.onFirstCall().rejects(new Error('SQS unavailable'));
    const first = await submit();
    const second = await submit();
    expect(first.statusCode).to.equal(503);
    expect(first.json().state).to.equal('FAILED');
    expect(second.statusCode).to.equal(200);
    expect(second.json().state).to.equal('SENT');
    expect((await submit()).json()).to.deep.equal(second.json());
    expect(sendMessage.callCount).to.equal(2);
    expect(fetchStub.callCount).to.equal(1);
  });
});
