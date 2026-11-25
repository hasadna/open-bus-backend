import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { createServer } from '../src/config/server.config.js';
import { globalErrorHandler } from '../src/middleware/errorHandler.js';
import { registerRoutes } from '../src/routes/index.js';

describe('rate limits', () => {
  it('enforces the default and submission limits separately for each client IP', async () => {
    const env = sinon.stub(process, 'env').value({ ...process.env, NODE_ENV: 'production', LOG_LEVEL: 'silent', TRUSTED_PROXIES: '10.0.0.1' });
    let app;
    try {
      app = await createServer();
      app.setErrorHandler(globalErrorHandler);
      registerRoutes(app);

      const submit = (url, clientIp = '192.0.2.10') =>
        app.inject({
          method: 'POST',
          url,
          payload: {},
          remoteAddress: '10.0.0.1',
          headers: { 'x-forwarded-for': clientIp },
        });

      for (const [url, status] of [
        ['/issues/create', 400],
        ['/complaints/send', 501],
      ]) {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          expect((await submit(url)).statusCode).to.equal(status);
        }
        const limited = await submit(url);
        expect(limited.statusCode).to.equal(429);
        expect(Number(limited.headers['retry-after'])).to.be.within(1, 60);
        expect(limited.json().error).to.equal('Too many requests');
        expect((await submit(url, '192.0.2.20')).statusCode).to.equal(status);
      }

      const get = (url, clientIp = '192.0.2.10') => app.inject({ url, remoteAddress: '10.0.0.1', headers: { 'x-forwarded-for': clientIp } });

      const docs = await get('/docs/json');
      expect(docs.statusCode).to.equal(200);
      expect(docs.headers['x-ratelimit-limit']).to.equal('100');
      for (let attempt = 0; attempt < 99; attempt += 1) {
        expect((await get('/')).statusCode).to.equal(200);
      }
      const limited = await get('/');
      expect(limited.statusCode).to.equal(429);
      expect(Number(limited.headers['retry-after'])).to.be.within(1, 60);
      expect((await get('/', '192.0.2.20')).statusCode).to.equal(200);
    } finally {
      env.restore();
      await app?.close();
    }
  });
});
