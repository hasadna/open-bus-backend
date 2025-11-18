import axios from 'axios';
import { expect } from 'chai';
import sinon from 'sinon';

import { getReferenceNumber } from '../src/utils/getReferenceNumber.js';
import { cleanup } from './test.utils.js';

describe('getReferenceNumber', () => {
  let get;

  beforeEach(() => {
    get = sinon.stub(axios, 'get');
  });

  afterEach(() => {
    cleanup();
  });

  it('should return the reference number', async () => {
    get.resolves({ data: '<span id="ReferenceNumber">1234567</span>' });
    const result = await getReferenceNumber();
    expect(result).to.equal('1234567');
  });

  it('should return null if #ReferenceNumber not found', async () => {
    get.resolves({ data: '<div>No ref</div>' });
    const result = await getReferenceNumber();
    expect(result).to.be.null;
  });
});
