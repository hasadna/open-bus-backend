import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import { getReferenceNumber } from '../src/utils/get_reference_number.js';

describe('getReferenceNumber', () => {
  it('should fetch and extract a reference number', async () => {
    const isDebug = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'test';
    const ref = await getReferenceNumber(isDebug);

    assert.ok(ref, 'Reference number should be returned');
    assert.match(ref, /^[0-9]+$/u);
  });
});
