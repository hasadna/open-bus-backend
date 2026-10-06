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
      const modelTitles = Object.values(document.components.schemas).map((schema) => schema.title);
      expect(modelTitles).to.include('ComplaintFormSchema');
      expect(modelTitles).to.include('GithubIssueModel');
      expect(document.paths).to.have.property('/issues/create');
      expect(document.paths).to.have.property('/complaints/send');
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
