import { expect } from 'chai';
import f from 'fastify';
import { describe, it } from 'mocha';

import { swaggerConfig } from '../src/config/swagger.config.js';
import { registerRoutes } from '../src/routes/index.js';
import { createIssueSchema } from '../src/schemas/issues.schema.js';

describe('TypeBox route schemas', () => {
  it('registers model references and generates Swagger documentation', async () => {
    const app = f();
    try {
      await app.register(import('@fastify/swagger'), swaggerConfig);
      registerRoutes(app);
      await app.ready();

      const document = app.swagger();
      expect(document.components.schemas).to.have.property('ComplaintFormSchema');
      expect(document.components.schemas).to.have.property('GithubIssueModel');
      expect(document.paths['/'].get.operationId).to.equal('healthGet');
      expect(document.paths['/issues/create'].post.operationId).to.equal('issuesCreatePost');
      expect(document.paths['/complaints/send'].post.operationId).to.equal('complaintsSendPost');
    } finally {
      await app.close();
    }
  });

  it('enforces issue required fields and applies the debug default', async () => {
    const app = f();
    try {
      app.post('/validate', { schema: { body: createIssueSchema.body } }, (request) => request.body);
      await app.ready();
      const missing = await app.inject({ method: 'POST', url: '/validate', payload: {} });
      expect(missing.statusCode).to.equal(400);

      const valid = {
        type: 'bug',
        title: 'Test issue',
        contactName: 'Jane',
        contactEmail: 'jane@example.com',
        description: 'A long enough description',
        environment: 'Browser',
        expectedBehavior: 'Expected result',
        actualBehavior: 'Actual result',
        reproducibility: 'always',
      };
      const defaults = await app.inject({ method: 'POST', url: '/validate', payload: valid });
      expect(defaults.statusCode).to.equal(200);
      expect(defaults.json().debug).to.equal(false);
      expect(defaults.json().publishContactEmail).to.equal(false);

      const withoutEmail = { ...valid };
      delete withoutEmail.contactEmail;
      const anonymous = await app.inject({ method: 'POST', url: '/validate', payload: withoutEmail });
      expect(anonymous.statusCode).to.equal(200);

      const badEmail = await app.inject({ method: 'POST', url: '/validate', payload: { ...valid, contactEmail: 'not-an-email' } });
      expect(badEmail.statusCode).to.equal(400);
    } finally {
      await app.close();
    }
  });

  it('validates complaint fields through registered model references', async () => {
    const app = f();
    try {
      registerRoutes(app);
      await app.ready();
      const response = await app.inject({
        method: 'POST',
        url: '/complaints/send',
        payload: { data: { personalDetails: { mobile: 'invalid' } } },
      });
      expect(response.statusCode).to.equal(400);
    } finally {
      await app.close();
    }
  });
});
