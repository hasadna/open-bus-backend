import axios from 'axios';
import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

import { createIssue } from '../src/controllers/issues.controller.js';
import { cleanup, createMockGitHubError, createMockGitHubResponse, createMockReply, createMockRequest, setupGitHubEnv } from './test.utils.js';

describe('createIssue', () => {
  let post;
  let reply;
  let request;

  beforeEach(() => {
    request = createMockRequest({
      actualBehavior: 'Does not work',
      attachments: [],
      contactEmail: 'john@example.com',
      contactName: 'John Doe',
      description: 'Test description',
      environment: 'Test environment',
      expectedBehavior: 'Should work',
      reproducibility: 'Always',
      title: 'Test Issue',
    });

    reply = createMockReply();
    post = sinon.stub(axios, 'post');
    setupGitHubEnv();
  });

  afterEach(() => {
    cleanup();
  });

  it('should create a GitHub issue and return the response data', async () => {
    const mockResponse = createMockGitHubResponse(123, 'Test Issue');

    post.resolves(mockResponse);

    await createIssue(request, reply, axios);

    expect(reply.sendCalledWith.success).to.equal(true);
    expect(reply.sendCalledWith.data).to.deep.equal(mockResponse.data);
    expect(reply.statusCalledWith).to.equal(200);
    expect(post.calledOnce).to.be.true;
  });

  it('should handle errors and return 500', async () => {
    const error = new Error('GitHub error');

    error.code = undefined;
    post.rejects(error);

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(500);
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the issue',
    });
  });

  it('should handle 401 Unauthorized from GitHub API', async () => {
    const error = createMockGitHubError(401, 'Unauthorized');

    post.rejects(error);

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(401);
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Authentication failed',
      message: 'Invalid GitHub token or insufficient permissions',
    });
  });

  it('should send correct payload to GitHub API', async () => {
    const mockResponse = createMockGitHubResponse(1, 'Test Issue');

    post.resolves(mockResponse);

    await createIssue(request, reply, axios);

    expect(post.calledOnce).to.be.true;

    const [url, payload, config] = post.firstCall.args;

    expect(url).to.equal('https://api.github.com/repos/fake-owner/fake-repo/issues');
    expect(payload.title).to.equal('Test Issue');
    expect(payload.labels).to.deep.equal(['REPORTED-BY-USER']);
    expect(payload.body).to.include('**Contact Name:** John Doe');
    expect(config.headers.Authorization).to.equal('Bearer fake-token');
    expect(config.headers['Content-Type']).to.equal('application/json');
  });

  it('should work with missing optional fields', async () => {
    request.body.attachments = undefined;
    request.body.environment = undefined;
    request.body.expectedBehavior = undefined;
    request.body.actualBehavior = undefined;
    request.body.reproducibility = undefined;

    const mockResponse = createMockGitHubResponse(123, 'Test Issue');

    post.resolves(mockResponse);

    await createIssue(request, reply, axios);

    expect(reply.sendCalledWith).to.have.property('success', true);
    expect(reply.sendCalledWith.data).to.have.property('id', 123);
  });

  it('should handle missing GitHub env variables gracefully', async () => {
    setupGitHubEnv({
      GITHUB_OWNER: undefined,
      GITHUB_REPO: undefined,
      GITHUB_TOKEN: undefined,
    });

    await createIssue(request, reply, axios);

    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Configuration error',
      message: 'GitHub configuration is incomplete',
    });
  });

  it('should handle 404 Repository not found', async () => {
    const error = createMockGitHubError(404, 'Not Found');

    post.rejects(error);

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(500);
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Repository not found',
      message: 'The specified GitHub repository does not exist or is not accessible',
    });
  });

  it('should handle 422 Validation error', async () => {
    const error = createMockGitHubError(422, 'Validation Failed');

    post.rejects(error);

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(400);
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Invalid issue data',
      message: 'The issue data provided is invalid or contains errors',
    });
  });

  it('should handle network timeout errors', async () => {
    const error = new Error('timeout of 30000ms exceeded');

    error.code = 'ECONNABORTED';
    post.rejects(error);

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(500);
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Request timeout',
      message: 'The GitHub API request timed out',
    });
  });

  it('should handle network connection errors', async () => {
    const error = new Error('getaddrinfo ENOTFOUND api.github.com');

    error.code = 'ENOTFOUND';
    post.rejects(error);

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(500);
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Network error',
      message: 'Unable to connect to GitHub API',
    });
  });

  it('should mask the contact email in the issue body', async () => {
    const mockResponse = createMockGitHubResponse(1, 'Test Issue');

    post.resolves(mockResponse);

    await createIssue(request, reply, axios);

    const [, payload] = post.firstCall.args;

    expect(payload.body).to.include('**Contact Email:** joh*@example.com');
  });

  it('should return fake data when debug is true', async () => {
    request.body.debug = true;

    await createIssue(request, reply, axios);

    expect(reply.statusCalledWith).to.equal(200);
    expect(reply.sendCalledWith.success).to.be.true;
    expect(reply.sendCalledWith.data.number).to.equal(1347);
    expect(reply.sendCalledWith.data.id).to.equal(123456);
    expect(reply.sendCalledWith.data.title).to.equal('Test Issue');
    expect(reply.sendCalledWith.data.body).to.equal('Fake issue body for debugging');
    expect(reply.sendCalledWith.data.labels).to.deep.equal(['REPORTED-BY-USER']);
    expect(reply.sendCalledWith.data.state).to.equal('open');
    expect(reply.sendCalledWith.data.created_at).to.be.a('string');
    expect(reply.sendCalledWith.data.url).to.equal('https://api.github.com/repos/octocat/Hello-World/issues/1347');
    expect(reply.sendCalledWith.data.html_url).to.equal('https://github.com/octocat/Hello-World/issues/1347');
    expect(post.called).to.be.false;
    expect(request.log.info.calledWith('Debug mode: returning fake GitHub issue data')).to.be.true;
  });
});
