import { CreateQueueCommand, GetQueueAttributesCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { expect } from 'chai';
import f from 'fastify';
import { randomUUID } from 'node:crypto';
import sinon from 'sinon';

import { clearComplaintStatusCache } from '../src/controllers/complaints.controller.js';
import { registerRoutes } from '../src/routes/index.js';
import { complaintTitle } from '../src/templates/complaint.js';
import { ses } from '../src/utils/complaintDelivery.js';
import { sqs } from '../src/utils/complaintQueue.js';
import { data, train } from './complaintFixture.js';

describe('sendComplaint', () => {
  const uuid = randomUUID();
  let app;
  let sendMessage;
  let sesSend;
  beforeEach(async () => {
    clearComplaintStatusCache();
    const send = sinon.stub(sqs, 'send');
    send
      .withArgs(sinon.match.instanceOf(CreateQueueCommand))
      .callsFake((command) => Promise.resolve({ QueueUrl: command.input.QueueName === 'complaints-dlq' ? 'dlq' : 'complaints' }));
    send.withArgs(sinon.match.instanceOf(GetQueueAttributesCommand)).resolves({ Attributes: { QueueArn: 'arn:dlq' } });
    sendMessage = send.withArgs(sinon.match.instanceOf(SendMessageCommand)).resolves({ MessageId: 'message-123' });
    sesSend = sinon.stub(ses, 'send').rejects(new Error('HTTP must not call SES'));
    app = f();
    registerRoutes(app);
    await app.ready();
  });
  afterEach(async () => {
    await app.close();
    sinon.restore();
  });
  const submit = (headers = { 'pair-key': uuid }, payload = { data }) => app.inject({ method: 'POST', url: '/complaints/send', headers, payload });

  it('queues and caches acceptance without sending email', async () => {
    const first = await submit();
    expect(first.statusCode).to.equal(202);
    expect(first.json()).to.deep.equal({ success: true, state: 'PROCESSING', messageId: 'message-123' });
    expect((await submit()).json()).to.deep.equal(first.json());
    expect(sendMessage.callCount).to.equal(1);
    expect(sesSend.called).to.equal(false);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody)).to.deep.equal({
      email: data.email,
      pairKey: uuid,
      data: { ...data, title: complaintTitle(data) },
      debug: false,
    });
  });

  it('normalizes the pair-key and email for duplicate submissions', async () => {
    await submit({ 'pair-key': uuid.toUpperCase() }, { data: { ...data, email: 'Rider@example.com' } });
    await submit();
    expect(sendMessage.callCount).to.equal(1);
  });

  it('keeps different email addresses and debug modes separate', async () => {
    await submit();
    await submit(undefined, { data, debug: true });
    await submit(undefined, { data: { ...data, email: 'other@example.com' } });
    expect(sendMessage.callCount).to.equal(3);
    expect(JSON.parse(sendMessage.secondCall.args[0].input.MessageBody).debug).to.equal(true);
    expect(sesSend.called).to.equal(false);
  });

  it('shares the enqueue result between concurrent duplicates', async () => {
    let finish;
    let started;
    const ready = new Promise((resolve) => {
      started = resolve;
    });
    sendMessage.callsFake(() => {
      started();
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const first = submit();
    await ready;
    const second = submit();
    finish({ MessageId: 'shared' });
    const responses = await Promise.all([first, second]);
    expect(responses.map((response) => response.statusCode)).to.deep.equal([202, 202]);
    expect(responses[0].json()).to.deep.equal(responses[1].json());
    expect(sendMessage.callCount).to.equal(1);
  });

  it('allows retries after queue errors or missing message IDs', async () => {
    sendMessage.onFirstCall().rejects(new Error('SQS unavailable'));
    sendMessage.onSecondCall().resolves({});
    expect((await submit()).statusCode).to.equal(503);
    expect((await submit()).statusCode).to.equal(503);
    expect((await submit()).statusCode).to.equal(202);
    expect((await submit()).statusCode).to.equal(202);
    expect(sendMessage.callCount).to.equal(3);
    expect(sesSend.called).to.equal(false);
  });

  it('removes the SES webhook', async () => {
    expect((await app.inject({ method: 'POST', url: '/webhook/ses', payload: {} })).statusCode).to.equal(404);
  });
  it('preserves an optional Rav-Kav number and rejects invalid values', async () => {
    expect((await submit(undefined, { data: { ...data, ravkav: '12345678901' } })).statusCode).to.equal(202);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody).data.ravkav).to.equal('12345678901');
    const responses = await Promise.all(['123', '123456789012', '1234567890a'].map((ravkav) => submit(undefined, { data: { ...data, ravkav } })));
    expect(responses.map((response) => response.statusCode)).to.deep.equal([400, 400, 400]);
    expect(sendMessage.callCount).to.equal(1);
  });

  [undefined, 'he', 'en', 'ru', 'ar'].forEach((lang) => {
    ['firstName', 'lastName'].forEach((field) => {
      it(`validates ${field} for ${lang ?? 'default Hebrew'}`, async () => {
        const multilingual = lang !== undefined && lang !== 'he';
        const cases = [
          ['אביבה', 202],
          ['Anne-Marie', multilingual ? 202 : 400],
          ['محمد', multilingual ? 202 : 400],
          ['אביבה John محمد', multilingual ? 202 : 400],
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
    expect(sesSend.callCount).to.equal(0);
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
    expect((await submit(undefined, { data: payload })).statusCode).to.equal(202);
    expect(JSON.parse(sendMessage.firstCall.args[0].input.MessageBody).data).to.deep.equal(
      JSON.parse(JSON.stringify({ ...payload, title: complaintTitle(payload) })),
    );
  });

  it('accepts a train with the required fields', async () => {
    const { bus, ...fields } = data;
    expect(bus).to.exist;
    expect((await submit(undefined, { data: { ...fields, train } })).statusCode).to.equal(202);
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
    expect(responses.map((response) => response.statusCode)).to.deep.equal([400, 202, 400, 400]);
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
    expect(sesSend.called).to.equal(false);
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
      expect(sesSend.called).to.equal(false);
    });
  }

  it('accepts numeric zero as a selection code', async () => {
    const response = await submit(undefined, { data: { ...data, bus: { ...data.bus, raisingStation: { dataText: 'Station', dataCode: 0 } } } });
    expect(response.statusCode).to.equal(202);
    expect(sendMessage.callCount).to.equal(1);
  });

  it('limits complaint details to 400 characters', async () => {
    expect((await submit(undefined, { data: { ...data, details: 'a'.repeat(400) } })).statusCode).to.equal(202);
    expect((await submit(undefined, { data: { ...data, details: 'a'.repeat(401) } })).statusCode).to.equal(400);
  });

  it('limits passports to 10 characters', async () => {
    expect((await submit(undefined, { data: { ...data, id: undefined, passport: '1234567890' } })).statusCode).to.equal(202);
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
    expect(sesSend.called).to.equal(false);
  });
});
