import { expect } from 'chai'

import { buildXmlFrom } from '../gov_api/template_builder.js'
import { getReferenceNumber } from '../gov_api/get_reference_number.js'
import { sendComplaint } from './complaintController.js'

import jsonData from '../contextForCopilot/exampleInput.json' with { type: 'json' }

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
    expect(res.statusCalledWith).to.equal(200)
  })
})
