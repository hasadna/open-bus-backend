import { expect } from 'chai';
import ky from 'ky';
import sinon from 'sinon';

import { getReferenceNumber } from '../src/utils/getReferenceNumber.js';
import { cleanup } from './test.utils.js';

describe('getReferenceNumber', () => {
  let get;

  beforeEach(() => {
    get = sinon.stub(ky, 'get');
  });

  afterEach(() => {
    cleanup();
  });

  it('should return the reference number', async () => {
    get.resolves({ text: () => Promise.resolve('<span id="ReferenceNumber">1234567</span><input id="_form_guid" value="test-guid">') });
    const result = await getReferenceNumber();
    expect(result.ref).to.equal('123456711');
    expect(result.guid).to.equal('test-guid');
  });

  it('should return null if #ReferenceNumber not found', async () => {
    get.resolves({ text: () => Promise.resolve('<div>No ref</div>') });
    const result = await getReferenceNumber();
    expect(result).to.be.null;
  });
});
