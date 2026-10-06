import { expect } from 'chai';
import f from 'fastify';
import ky from 'ky';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

import { issuesRoutes } from '../src/routes/issues.routes.js';
import { loadModels } from '../src/schemas/loadModels.js';
import { cleanup, setupGitHubEnv } from './test.utils.js';

/**
 * Labels exactly as the GitHub REST API returns them: an array of objects.
 * See https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
const GITHUB_LABELS = [
  {
    color: 'ededed',
    default: false,
    description: null,
    id: 6450392658,
    name: 'REPORTED-BY-USER',
    node_id: 'LA_kwDOJMP9Ms8AAAABgHkuUg',
    url: 'https://api.github.com/repos/hasadna/open-bus-map-search/labels/REPORTED-BY-USER',
  },
];

const VALID_BODY = {
  actualBehavior: 'Does not work',
  contactEmail: 'john@example.com',
  contactName: 'John Doe',
  description: 'Test description long enough',
  environment: 'Test environment',
  expectedBehavior: 'Should work',
  reproducibility: 'always',
  title: 'Test Issue',
  type: 'bug',
};

/**
 * These tests drive the route through `fastify.inject`, so the response passes
 * through Fastify's schema serializer. The unit tests in `issues.test.js` call the
 * controller with a plain mock `reply`, which never serializes and therefore cannot
 * observe what the client actually receives.
 */
describe('createIssue response serialization', () => {
  let app;
  let post;

  beforeEach(async () => {
    setupGitHubEnv();
    post = sinon.stub(ky, 'post');

    app = f();
    loadModels(app);
    app.register(issuesRoutes, { prefix: 'issues' });
    await app.ready();
  });

  afterEach(async () => {
    cleanup();
    await app.close();
  });

  it('should preserve GitHub label objects in the serialized response', async () => {
    const githubIssue = {
      created_at: new Date().toISOString(),
      html_url: 'https://github.com/test/repo/issues/123',
      id: 123,
      labels: GITHUB_LABELS,
      number: 123,
      state: 'open',
      title: 'Test Issue',
      url: 'https://api.github.com/repos/test/repo/issues/123',
    };

    post.resolves({ json: () => Promise.resolve(githubIssue) });

    const response = await app.inject({ method: 'POST', payload: VALID_BODY, url: '/issues/create' });

    expect(response.statusCode).to.equal(200);
    expect(response.json().data.labels).to.deep.equal(GITHUB_LABELS);
  });

  it('should still accept labels sent as plain strings', async () => {
    const githubIssue = {
      created_at: new Date().toISOString(),
      html_url: 'https://github.com/test/repo/issues/124',
      id: 124,
      labels: ['REPORTED-BY-USER'],
      number: 124,
      state: 'open',
      title: 'Test Issue',
      url: 'https://api.github.com/repos/test/repo/issues/124',
    };

    post.resolves({ json: () => Promise.resolve(githubIssue) });

    const response = await app.inject({ method: 'POST', payload: VALID_BODY, url: '/issues/create' });

    expect(response.statusCode).to.equal(200);
    expect(response.json().data.labels).to.deep.equal(['REPORTED-BY-USER']);
  });
});
