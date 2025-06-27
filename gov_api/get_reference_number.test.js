import { strict as assert } from 'assert'

import { getReferenceNumber } from './get_reference_number.js'

describe('getReferenceNumber', () => {
  it('should fetch and extract a reference number from the GOV API', async () => {
    const ref = await getReferenceNumber()
    assert.ok(ref, 'Reference number should be returned from real API')
    assert.match(ref, /^[0-9]+$/)
  })
})
