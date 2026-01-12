import { expect } from 'chai';
import ky from 'ky';
import sinon from 'sinon';

import { GovRequest } from '../src/utils/govRequest.js';
import { cleanup } from './test.utils.js';

describe('GovRequest', () => {
  let getStub;
  let postStub;

  beforeEach(() => {
    getStub = sinon.stub(ky, 'get');
    postStub = sinon.stub(ky, 'post');
  });

  afterEach(() => {
    cleanup();
  });

  describe('get', () => {
    it('should call ky.get with correct URL and options', async () => {
      const endpoint = '/test-get';
      const options = { timeout: 10000 };
      const expectedUrl = 'https://esb.gov.il/govServiceList/test-get';
      const responseData = { foo: 'bar' };
      getStub.resolves({ json: () => Promise.resolve(responseData) });

      const result = await GovRequest.get(endpoint, options);
      expect(getStub.calledOnceWithExactly(expectedUrl, { timeout: 10000 })).to.be.true;
      expect(result).to.deep.equal(responseData);
    });

    it('should use globalOptions if no options provided', async () => {
      const endpoint = '/test-get';
      const expectedUrl = 'https://esb.gov.il/govServiceList/test-get';
      getStub.resolves({ json: () => Promise.resolve('ok') });
      await GovRequest.get(endpoint);
      expect(getStub.calledOnceWithExactly(expectedUrl, { timeout: 30000 })).to.be.true;
    });

    it('should throw error if ky.get rejects', async () => {
      const endpoint = '/test-get';
      const error = new Error('Network error');
      getStub.rejects(error);
      try {
        await GovRequest.get(endpoint);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });

  describe('post', () => {
    it('should call ky.post with correct URL, data, and options', async () => {
      const endpoint = '/test-post';
      const data = { foo: 'bar' };
      const options = { timeout: 5000 };
      const expectedUrl = 'https://esb.gov.il/govServiceList/test-post';
      const responseData = { baz: 'qux' };
      postStub.resolves({ json: () => Promise.resolve(responseData) });

      const result = await GovRequest.post(endpoint, data, options);
      expect(postStub.calledOnceWithExactly(expectedUrl, { json: data, timeout: 5000 })).to.be.true;
      expect(result).to.deep.equal(responseData);
    });

    it('should use globalOptions if no options provided', async () => {
      const endpoint = '/test-post';
      const data = { foo: 'bar' };
      const expectedUrl = 'https://esb.gov.il/govServiceList/test-post';
      postStub.resolves({ json: () => Promise.resolve('ok') });
      await GovRequest.post(endpoint, data);
      expect(postStub.calledOnceWithExactly(expectedUrl, { json: data, timeout: 30000 })).to.be.true;
    });

    it('should throw error if ky.post rejects', async () => {
      const endpoint = '/test-post';
      const data = { foo: 'bar' };
      const error = new Error('Network error');
      postStub.rejects(error);
      try {
        await GovRequest.post(endpoint, data);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });
});
