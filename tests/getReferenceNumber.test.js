import { expect } from 'chai';
import ky from 'ky';
import sinon from 'sinon';

import { getReferenceNumber } from '../src/utils/getReferenceNumber.js';
import { cleanup } from './test.utils.js';

describe('getReferenceNumber', () => {
  let getStub;

  beforeEach(() => {
    getStub = sinon.stub(ky, 'get');
    process.env.AWS_API_KEY = 'test-key';
    process.env.AWS_APP_ID = 'test-app';
  });

  afterEach(() => {
    cleanup();
    delete process.env.AWS_API_KEY;
    delete process.env.AWS_APP_ID;
  });

  it('should return the reference number', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ ref: '1234567', guid: 'test-guid' }),
    };
    getStub.resolves(mockResponse);
    const result = await getReferenceNumber();
    expect(result.ref).to.equal('1234567');
    expect(result.guid).to.equal('test-guid');
  });

  it('should reject on missing AWS credentials', async () => {
    delete process.env.AWS_API_KEY;
    try {
      await getReferenceNumber();
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e.message).to.equal('Missing AWS credentials');
    }
  });

  it('should reject on HTTP error', async () => {
    const mockResponse = {
      ok: false,
    };
    getStub.resolves(mockResponse);
    try {
      await getReferenceNumber();
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e.message).to.equal('Failed to get Reference Number');
    }
  });

  it('should reject on invalid JSON', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    };
    getStub.resolves(mockResponse);
    try {
      await getReferenceNumber();
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e.message).to.equal('Failed to get Reference Number');
    }
  });
});
