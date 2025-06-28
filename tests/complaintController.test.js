import { createRequire } from 'module';
import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { sendComplaint } from '../src/controllers/complaintController.js';
import { cleanup, createMockReply, createMockRequest } from './test-utils.js';

describe('sendComplaint', () => {
  const jsonData = createRequire(import.meta.url)('../gov_api/exampleInput.json');
  let request, reply;

  beforeEach(() => {
    request = createMockRequest(jsonData);
    reply = createMockReply();
  });

  afterEach(() => {
    cleanup();
  });

  it('should test the complaint controller', async () => {
    await sendComplaint(request, reply);

    expect(reply.sendCalledWith.success).to.equal(true);
    expect(reply.sendCalledWith.xml).to.not.be.undefined;
    expect(reply.statusCalledWith).to.equal(200);

    // Verify logging was called
    expect(request.log.info.called).to.be.true;
  });

  it('should handle missing required fields', async () => {
    request.body = {};

    await sendComplaint(request, reply);

    expect(reply.statusCalledWith).to.equal(500);
    expect(reply.sendCalledWith).to.have.property('error');
  });

  it('should log the complaint processing', async () => {
    await sendComplaint(request, reply);

    expect(request.log.info.called).to.be.true;
    const logCall = request.log.info.firstCall;
    expect(logCall.args[0]).to.equal('Complaint submission started');
  });
});
