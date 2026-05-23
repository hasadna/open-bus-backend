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

  it('should return the reference number and request id from formParams', async () => {
    get.resolves({
      text: () =>
        Promise.resolve(`<script type="text/javascript" id="govFormsScript"> var formParams = {
  "process": {
    "formUniqueID": "UJdQLbqX3BF1jDydDZJ0fQ",
    "requestID": "ff9869f2-aeec-4f37-a673-aa9ba23406b1",
    "referenceNumber": 143098
  }
}</script>`),
    });
    const result = await getReferenceNumber();
    expect(result).to.deep.equal({
      formUniqueID: 'UJdQLbqX3BF1jDydDZJ0fQ',
      referenceNumber: '143098',
      requestID: 'ff9869f2-aeec-4f37-a673-aa9ba23406b1',
    });
  });

  it('should return null if formParams process identifiers are not found', async () => {
    get.resolves({ text: () => Promise.resolve('<div>No ref</div>') });
    const result = await getReferenceNumber();
    expect(result).to.be.null;
  });
});
