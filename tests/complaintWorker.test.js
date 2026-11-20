import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { DeleteMessageCommand, GetQueueAttributesCommand, GetQueueUrlCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { expect } from 'chai';
import f from 'fastify';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import sinon from 'sinon';

import { ses, simulatorRecipients } from '../src/jobs/complaints/delivery.js';
import { clearComplaintQueueCache, sqs } from '../src/jobs/complaints/queue.js';
import { processComplaintMessage, startComplaintWorkers } from '../src/jobs/complaints/worker.js';
import { data } from './complaintFixture.js';

describe('complaint queue workers', () => {
  let originalEnv;
  let send;
  let sesSend;
  let log;
  const message = (payload = { pairKey: randomUUID(), data, debug: false }) => ({
    MessageId: 'message-123',
    ReceiptHandle: 'receipt-123',
    Body: JSON.stringify(payload),
  });
  beforeEach(() => {
    clearComplaintQueueCache();
    originalEnv = { ...process.env };
    process.env.SES_EMAIL = 'complaints@verified.example';
    process.env.SES_COMPLAINTS_EMAIL = 'target@example.com';
    delete process.env.SES_CONFIGURATION_SET;
    send = sinon.stub(sqs, 'send');
    send.withArgs(sinon.match.instanceOf(DeleteMessageCommand)).resolves({});
    send
      .withArgs(sinon.match.instanceOf(GetQueueUrlCommand))
      .callsFake((command) => Promise.resolve({ QueueUrl: command.input.QueueName === 'complaints-dlq' ? 'dlq' : 'complaints' }));
    const dlqArn = 'arn:aws:sqs:us-east-1:123456789012:complaints-dlq';
    send.withArgs(sinon.match.instanceOf(GetQueueAttributesCommand)).callsFake((command) => {
      const Attributes =
        command.input.QueueUrl === 'dlq'
          ? { QueueArn: dlqArn }
          : { RedrivePolicy: JSON.stringify({ deadLetterTargetArn: dlqArn, maxReceiveCount: 1 }) };
      return Promise.resolve({ Attributes });
    });
    sesSend = sinon.stub(ses, 'send').resolves({ MessageId: 'email-123' });
    log = { error: sinon.stub() };
  });
  afterEach(() => {
    clearComplaintQueueCache();
    sinon.restore();
    for (const name of ['SES_EMAIL', 'SES_COMPLAINTS_EMAIL', 'SES_CONFIGURATION_SET']) {
      if (originalEnv[name] === undefined) delete process.env[name];
      else process.env[name] = originalEnv[name];
    }
  });

  it('sends the complaint and returns it for acknowledgement', async () => {
    const queued = message();
    expect(await processComplaintMessage(queued, false, log)).to.equal(queued);
    const command = sesSend.firstCall.args[0];
    expect(command).to.be.instanceOf(SendEmailCommand);
    expect(command.input.FromEmailAddress).to.equal(process.env.SES_EMAIL);
    expect(command.input.Destination.ToAddresses).to.deep.equal(['target@example.com']);
    expect(command.input.ReplyToAddresses).to.deep.equal([data.email]);
    expect(command.input).not.to.have.property('ConfigurationSetName');
    expect(sesSend.firstCall.args[1].abortSignal).to.be.instanceOf(AbortSignal);
    expect(send.called).to.equal(false);
  });

  it('preserves an optional SES configuration set', async () => {
    process.env.SES_CONFIGURATION_SET = 'complaints';
    await processComplaintMessage(message(), false, log);
    expect(sesSend.firstCall.args[0].input.ConfigurationSetName).to.equal('complaints');
  });

  for (const lang of ['he', 'en', 'ru', 'ar']) {
    it(`preserves ${lang} and localizes the DLQ notification`, async () => {
      const queued = message({ pairKey: randomUUID(), data: { ...data, lang } });
      await processComplaintMessage(queued, false, log);
      const target = sesSend.firstCall.args[0].input;
      expect(target.EmailTags).to.deep.include({ Name: 'lang', Value: lang });
      expect(target.Content.Simple.Body.Html.Data).to.include('lang="he" dir="rtl"');
      await processComplaintMessage(queued, true, log);
      const notification = sesSend.secondCall.args[0].input;
      expect(notification.Destination.ToAddresses).to.deep.equal([data.email]);
      expect(notification.Content.Simple.Body.Html.Data).to.include(`lang="${lang}"`);
      expect(notification.Content.Simple.Body.Text.Data).to.include('message-123');
      expect(notification.EmailTags).to.deep.include({ Name: 'purpose', Value: 'complaint_failure_notification' });
    });
  }

  it('sends the debug complaint directly to the submitter in one SES request', async () => {
    const queued = message({ pairKey: randomUUID(), data, debug: true });
    expect(await processComplaintMessage(queued, false, log)).to.equal(queued);
    expect(sesSend.calledOnce).to.equal(true);
    const complaint = sesSend.firstCall.args[0].input;
    expect(complaint.Destination.ToAddresses).to.deep.equal([data.email]);
    expect(complaint.EmailTags).to.deep.include({ Name: 'purpose', Value: 'complaint' });
    expect(complaint.EmailTags).to.deep.include({ Name: 'debug', Value: 'true' });
    expect(complaint.Content.Simple.Body.Text.Data).to.include(data.details);
  });

  it('leaves a failed debug complaint for redrive and notifies the submitter from the DLQ', async () => {
    sesSend.onFirstCall().rejects(new Error('SES unavailable'));
    const queued = message({ pairKey: randomUUID(), data, debug: true });
    await expectFailure(processComplaintMessage(queued, false, log));
    expect(log.error.calledOnce).to.equal(true);
    expect(await processComplaintMessage(queued, true, log)).to.equal(queued);
    expect(sesSend.secondCall.args[0].input.Destination.ToAddresses).to.deep.equal([data.email]);
  });

  it('leaves a bounce debug complaint for redrive and sends its DLQ notification to the submitter', async () => {
    const queued = message({ pairKey: randomUUID(), data, debug: 'bounce' });
    expect(await processComplaintMessage(queued, false, log)).to.equal(undefined);
    expect(sesSend.firstCall.args[0].input.Destination.ToAddresses).to.deep.equal([simulatorRecipients.bounce]);
    expect(log.error.called).to.equal(false);
    expect(await processComplaintMessage(queued, true, log)).to.equal(queued);
    const notification = sesSend.secondCall.args[0].input;
    expect(notification.Destination.ToAddresses).to.deep.equal([data.email]);
    expect(notification.EmailTags).to.deep.include({ Name: 'purpose', Value: 'complaint_failure_notification' });
  });

  it('describes a debug DLQ notification as a delivery test', async () => {
    const queued = message({ pairKey: randomUUID(), data: { ...data, lang: 'en' }, debug: 'bounce' });
    await processComplaintMessage(queued, true, log);
    const { Subject, Body } = sesSend.firstCall.args[0].input.Content.Simple;
    expect(Subject.Data).to.equal('Open Bus complaint delivery test failed');
    for (const part of [Body.Text, Body.Html]) {
      expect(part.Data).to.include('simulated delivery test');
      expect(part.Data).not.to.include('Ministry of Transport');
      expect(part.Data).not.to.include('try submitting');
    }
  });

  for (const failure of ['rejected request', 'missing SES ID', 'missing sender', 'missing target']) {
    it(`leaves the source message for redrive on ${failure}`, async () => {
      if (failure === 'rejected request') sesSend.rejects(new Error('SES unavailable'));
      if (failure === 'missing SES ID') sesSend.resolves({});
      if (failure === 'missing sender') delete process.env.SES_EMAIL;
      if (failure === 'missing target') delete process.env.SES_COMPLAINTS_EMAIL;
      await expectFailure(processComplaintMessage(message(), false, log));
      expect(send.called).to.equal(false);
      expect(log.error.calledOnce).to.equal(true);
    });
  }

  it('deletes a DLQ message after one failed notification without requeueing', async () => {
    sesSend.rejects(new Error('SES unavailable'));
    const queued = message();
    expect(await processComplaintMessage(queued, true, log)).to.equal(queued);
    expect(sesSend.calledOnce).to.equal(true);
    expect(log.error.calledOnce).to.equal(true);
    expect(send.called).to.equal(false);
  });

  for (const [name, payload] of [
    ['null', null],
    ['empty object', {}],
    ['invalid email', { pairKey: randomUUID(), data: { ...data, email: 'invalid' } }],
    ['invalid debug flag', { pairKey: randomUUID(), data, debug: 'true' }],
  ]) {
    it(`redrives invalid source payloads and discards invalid DLQ payloads: ${name}`, async () => {
      await expectFailure(processComplaintMessage(message(payload), false, log));
      expect(send.called).to.equal(false);
      const queued = message(payload);
      expect(await processComplaintMessage(queued, true, log)).to.equal(queued);
      expect(sesSend.called).to.equal(false);
      expect(send.called).to.equal(false);
    });
  }

  it('handles malformed JSON without sending email', async () => {
    const queued = { ...message(), Body: '{broken' };
    await expectFailure(processComplaintMessage(queued, false, log));
    expect(send.called).to.equal(false);
    expect(await processComplaintMessage(queued, true, log)).to.equal(queued);
    expect(sesSend.called).to.equal(false);
    expect(send.called).to.equal(false);
  });

  it('rejects messages missing receipt handles or IDs before sending', async () => {
    for (const field of ['ReceiptHandle', 'MessageId']) {
      const queued = message();
      delete queued[field];
      try {
        await processComplaintMessage(queued, false, log);
        expect.fail('Expected invalid metadata to fail');
      } catch (error) {
        expect(error.message).to.include('receipt handle or message ID');
      }
    }
    expect(sesSend.called).to.equal(false);
  });

  async function expectFailure(pending) {
    let failed = false;
    try {
      await pending;
    } catch {
      failed = true;
    }
    expect(failed).to.equal(true);
  }

  async function consumeOne(deadLetter = false, queued = message()) {
    let deliver;
    const delivered = new Promise((resolve) => {
      deliver = resolve;
    });
    send.withArgs(sinon.match.instanceOf(ReceiveMessageCommand)).callsFake((command) => {
      if (command.input.QueueUrl === (deadLetter ? 'dlq' : 'complaints')) {
        return delivered.then(() => ({ Messages: [queued] }));
      }
      return Promise.resolve({});
    });
    const app = f();
    const consumers = await startComplaintWorkers(app);
    const consumer = consumers[deadLetter ? 1 : 0];
    return { app, consumers, consumer, deliver };
  }

  it('lets sqs-consumer delete successfully processed messages', async () => {
    const { app, consumer, deliver } = await consumeOne();
    const processed = once(consumer, 'message_processed');
    deliver();
    try {
      await processed;
      const deletion = send.getCalls().find((call) => call.args[0] instanceof DeleteMessageCommand);
      expect(deletion.args[0].input).to.deep.equal({ QueueUrl: 'complaints', ReceiptHandle: 'receipt-123' });
      expect(sesSend.firstCall.calledBefore(deletion)).to.equal(true);
    } finally {
      await app.close();
    }
  });

  it('does not acknowledge failed target sends', async () => {
    sesSend.rejects(new Error('SES unavailable'));
    const { app, consumer, deliver } = await consumeOne();
    const failed = once(consumer, 'processing_error');
    deliver();
    try {
      await failed;
      expect(send.calledWith(sinon.match.instanceOf(DeleteMessageCommand))).to.equal(false);
    } finally {
      await app.close();
    }
  });

  it('leaves simulated bounces unacknowledged without emitting a processing error', async () => {
    const queued = message({ pairKey: randomUUID(), data, debug: 'bounce' });
    const { app, consumer, deliver } = await consumeOne(false, queued);
    const processingError = sinon.spy();
    consumer.on('processing_error', processingError);
    const processed = once(consumer, 'response_processed');
    deliver();
    try {
      await processed;
      expect(sesSend.calledOnce).to.equal(true);
      expect(send.calledWith(sinon.match.instanceOf(DeleteMessageCommand))).to.equal(false);
      expect(processingError.called).to.equal(false);
    } finally {
      await app.close();
    }
  });

  it('acknowledges DLQ messages even when the user notification fails', async () => {
    sesSend.rejects(new Error('SES unavailable'));
    const { app, consumer, deliver } = await consumeOne(true);
    const processed = once(consumer, 'message_processed');
    deliver();
    try {
      await processed;
      const deletion = send.getCalls().find((call) => call.args[0] instanceof DeleteMessageCommand);
      expect(deletion.args[0].input.QueueUrl).to.equal('dlq');
      expect(sesSend.calledOnce).to.equal(true);
    } finally {
      await app.close();
    }
  });

  it('surfaces deletion errors without immediately resending email', async () => {
    send.withArgs(sinon.match.instanceOf(DeleteMessageCommand)).rejects(new Error('Delete failed'));
    const { app, consumer, deliver } = await consumeOne(true);
    // error is an EventEmitter special event, so listen directly rather than using once().
    const failed = new Promise((resolve) => consumer.once('error', resolve));
    deliver();
    try {
      const error = await failed;
      expect(error.message).to.include('Delete failed');
      expect(sesSend.calledOnce).to.equal(true);
    } finally {
      await app.close();
    }
  });

  it('polls both queues and waits for their final polls on close', async function () {
    this.timeout(5_000);
    const polls = [];
    send.withArgs(sinon.match.instanceOf(ReceiveMessageCommand)).callsFake(
      (command, options) =>
        new Promise((resolve) => {
          polls.push({ command, signal: options.abortSignal, finish: resolve });
        }),
    );
    const app = f();
    const consumers = await startComplaintWorkers(app);
    expect(polls.map((poll) => poll.command.input.QueueUrl)).to.deep.equal(['complaints', 'dlq']);
    for (const poll of polls) {
      expect(poll.command.input).to.include({ MaxNumberOfMessages: 1, WaitTimeSeconds: 20, VisibilityTimeout: 60 });
    }
    const closing = app.close();
    for (const poll of polls) poll.finish({});
    await closing;
    expect(consumers.every((consumer) => !consumer.status.isRunning && !consumer.status.isPolling)).to.equal(true);
    expect(polls.every((poll) => !poll.signal.aborted)).to.equal(true);
  });

  it('waits for active SES processing and acknowledgement during shutdown', async function () {
    this.timeout(5_000);
    let finishSend;
    let started;
    const ready = new Promise((resolve) => {
      started = resolve;
    });
    sesSend.callsFake(() => {
      started();
      return new Promise((resolve) => {
        finishSend = resolve;
      });
    });
    const { app, deliver } = await consumeOne();
    deliver();
    await ready;
    let closed = false;
    const closing = app.close().then(() => {
      closed = true;
    });
    await new Promise((resolve) => setImmediate(resolve));
    expect(closed).to.equal(false);
    finishSend({ MessageId: 'email-123' });
    await closing;
    const deletion = send.getCalls().find((call) => call.args[0] instanceof DeleteMessageCommand);
    expect(deletion).to.exist;
    expect(deletion.args[1].abortSignal.aborted).to.equal(false);
  });

  it('lets sqs-consumer back off polling errors and stop scheduled polling', async function () {
    this.timeout(10_000);
    const receive = send.withArgs(sinon.match.instanceOf(ReceiveMessageCommand)).rejects(new Error('SQS unavailable'));
    const app = f();
    try {
      await startComplaintWorkers(app);
      await new Promise((resolve) => setImmediate(resolve));
      expect(receive.callCount).to.equal(2);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(receive.callCount).to.equal(2);
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      expect(receive.callCount).to.equal(4);
      await app.close();
      expect(receive.callCount).to.equal(4);
    } finally {
      await app.close();
    }
  });
});
