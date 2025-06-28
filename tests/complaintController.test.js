import { expect } from 'chai'
import sinon from 'sinon'

import { sendComplaint } from '../src/controllers/complaintController.js'
import { createMockReply, createMockRequest, cleanup } from './test-utils.js'

import jsonData from '../gov_api/exampleInput.json' with { type: 'json' }

describe('sendComplaint', () => {
  let request, reply

  beforeEach(() => {
    request = createMockRequest(jsonData)
    reply = createMockReply()
  })

  afterEach(() => {
    cleanup()
  })

  it('should test the complaint controller', async () => {
    await sendComplaint(request, reply)

    expect(reply.sendCalledWith.success).to.equal(true)
    expect(reply.sendCalledWith.xml).to.not.be.undefined
    expect(reply.statusCalledWith).to.equal(200)

    // Verify logging was called
    expect(request.log.info.called).to.be.true
  })

  it('should handle missing required fields', async () => {
    request.body = {}

    await sendComplaint(request, reply)

    expect(reply.statusCalledWith).to.equal(500)
    expect(reply.sendCalledWith).to.have.property('error')
  })

  it('should log the complaint processing', async () => {
    await sendComplaint(request, reply)

    expect(request.log.info.called).to.be.true
    const logCall = request.log.info.firstCall
    expect(logCall.args[0]).to.equal('Complaint submission started')
  })
})
