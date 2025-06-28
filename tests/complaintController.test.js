import { expect } from 'chai'

import { sendComplaint } from '../src/controllers/complaintController.js'

import jsonData from '../gov_api/exampleInput.json' with { type: 'json' }

describe('sendComplaint', () => {
  let req, res

  beforeEach(() => {
    req = {
      body: jsonData,
    }
    res = {
      jsonCalledWith: null,
      statusCalledWith: null,
      json(data) {
        this.jsonCalledWith = data
        return this
      },
      status(code) {
        this.statusCalledWith = code
        return this
      },
    }
  })

  it('should test the complaint controller', async () => {
    await sendComplaint(req, res)
    expect(res.jsonCalledWith.success).to.equal(true)
    expect(res.jsonCalledWith.xml).to.not.be.undefined
    expect(res.statusCalledWith).to.equal(200)
  })
})
