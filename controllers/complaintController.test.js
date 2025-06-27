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
    // myAxios = {
    //   post: async () => ({ data: { success: true, debug: true, xml } }),
    // }
  })

  it('should test the complaint controller', async () => {
    req.body.ReferenceNumber = await getReferenceNumber(req.body.debug)
    const xml = buildXmlFrom(req.body)
    await sendComplaint(req, res)
    expect(res.jsonCalledWith).to.deep.equal({ data: { success: true, debug: true, xml } })
    expect(res.statusCalledWith).to.be.null
  })
})
