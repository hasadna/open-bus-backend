import { expect } from 'chai'

import { sendComplaint } from '../src/controllers/complaintController.js'

import jsonData from '../gov_api/exampleInput.json' with { type: 'json' }

describe('sendComplaint', () => {
  let request, reply

  beforeEach(() => {
    request = {
      body: jsonData,
    }
    reply = {
      sendCalledWith: null,
      statusCalledWith: null,
      send(data) {
        this.sendCalledWith = data
        return this
      },
      status(code) {
        this.statusCalledWith = code
        return this
      },
    }
  })

  it('should test the complaint controller', async () => {
    await sendComplaint(request, reply)
    expect(reply.sendCalledWith.success).to.equal(true)
    expect(reply.sendCalledWith.xml).to.not.be.undefined
    expect(reply.statusCalledWith).to.equal(200)
  })
})
