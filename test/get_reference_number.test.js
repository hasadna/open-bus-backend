import { strict as assert } from 'assert'

import { getReferenceNumber } from '../gov_api/get_reference_number.js'

describe('getReferenceNumber', () => {
  it('should fetch and extract a reference number from the GOV API', async () => {
    const isRunOnGitHub = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    const ref = await getReferenceNumber(isRunOnGitHub)
    assert.ok(ref, 'Reference number should be returned from real API')
    assert.match(ref, /^[0-9]+$/)
  }).timeout(10000)
})
