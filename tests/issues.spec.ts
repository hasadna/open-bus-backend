import { IssuesController } from '../src/issues/issues.controller';
import { cleanup, createMockGitHubError, createMockGitHubResponse, createMockRequest, setupGitHubEnv } from './test.utils.spec';
import { jest } from '@jest/globals';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

describe('createIssue', () => {
  const { createIssue } = new IssuesController();
  let request: any;

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
    setupGitHubEnv();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('should create a GitHub issue and return the response data', async () => {
    const mockResponse = createMockGitHubResponse(123, 'Test Issue');

    jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);

    const result = await createIssue(request.body);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse.data);
    expect(axios.post).toHaveBeenCalled();
  });

  it('should handle errors and return 500', async () => {
    const error = new Error('GitHub error');

    (error as any).code = undefined;
    jest.spyOn(axios, 'post').mockRejectedValue(error);

    await expect(createIssue(request)).rejects.toThrow(HttpException);
    await expect(createIssue(request)).rejects.toMatchObject({
      response: {
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the issue',
      },
      status: 500,
    });
  });

  it('should handle 401 Unauthorized from GitHub API', async () => {
    const error = createMockGitHubError(401, 'Unauthorized');

    jest.spyOn(axios, 'post').mockRejectedValue(error);

    await expect(createIssue(request)).rejects.toThrow(HttpException);
    await expect(createIssue(request)).rejects.toMatchObject({
      response: {
        error: 'Authentication failed',
        message: 'Invalid GitHub token or insufficient permissions',
      },
      status: 401,
    });
  });

  it('should send correct payload to GitHub API', async () => {
    const mockResponse = createMockGitHubResponse(1, 'Test Issue');

    jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);

    const result = await createIssue(request.body);

    expect(result.success).toBe(true);
    expect(axios.post).toHaveBeenCalled();

    const [url, payload, config] = (axios.post as jest.MockedFunction<typeof axios.post>).mock.calls[0];

    expect(url).toBe('https://api.github.com/repos/fake-owner/fake-repo/issues');
    expect((payload as any).title).toBe('Test Issue');
    expect((payload as any).labels).toEqual(['REPORTED-BY-USER']);
    expect((payload as any).body).toContain('**Contact Name:** John Doe');
    expect(config?.headers?.Authorization).toBe('Bearer fake-token');
    expect(config?.headers?.['Content-Type']).toBe('application/json');
  });

  it('should work with missing optional fields', async () => {
    request.body.attachments = undefined;
    request.body.environment = undefined;
    request.body.expectedBehavior = undefined;
    request.body.actualBehavior = undefined;
    request.body.reproducibility = undefined;

    const mockResponse = createMockGitHubResponse(123, 'Test Issue');

    jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);

    const result = await createIssue(request.body);

    expect(result).toHaveProperty('success', true);
    expect(result.data).toHaveProperty('id', 123);
  });

  it('should handle missing GitHub env variables gracefully', async () => {
    const originalEnv = { ...process.env };
    process.env.GITHUB_OWNER = '';
    process.env.GITHUB_REPO = '';
    process.env.GITHUB_TOKEN = '';

    await expect(createIssue(request.body)).rejects.toThrow(HttpException);
    await expect(createIssue(request.body)).rejects.toMatchObject({
      response: {
        error: 'GitHub API error',
        message: 'Status: undefined - undefined',
      },
      status: 500,
    });

    Object.assign(process.env, originalEnv);
  });

  it('should handle 404 Repository not found', async () => {
    const error = createMockGitHubError(404, 'Not Found');

    jest.spyOn(axios, 'post').mockRejectedValue(error);

    await expect(createIssue(request)).rejects.toThrow(HttpException);
    await expect(createIssue(request)).rejects.toMatchObject({
      response: {
        error: 'Repository not found',
        message: 'The specified GitHub repository does not exist or is not accessible',
      },
      status: 500,
    });
  });

  it('should handle 422 Validation error', async () => {
    const error = createMockGitHubError(422, 'Validation Failed');

    jest.spyOn(axios, 'post').mockRejectedValue(error);

    await expect(createIssue(request)).rejects.toThrow(HttpException);
    await expect(createIssue(request)).rejects.toMatchObject({
      response: {
        error: 'Invalid issue data',
        message: 'The issue data provided is invalid or contains errors',
      },
      status: 400,
    });
  });

  it('should handle network timeout errors', async () => {
    const error = new Error('timeout of 30000ms exceeded');

    (error as any).code = 'ECONNABORTED';
    jest.spyOn(axios, 'post').mockRejectedValue(error);

    await expect(createIssue(request)).rejects.toThrow(HttpException);
    await expect(createIssue(request)).rejects.toMatchObject({
      response: {
        error: 'Request timeout',
        message: 'The GitHub API request timed out',
      },
      status: 500,
    });
  });

  it('should handle network connection errors', async () => {
    const error = new Error('getaddrinfo ENOTFOUND api.github.com');

    (error as any).code = 'ENOTFOUND';
    jest.spyOn(axios, 'post').mockRejectedValue(error);

    await expect(createIssue(request)).rejects.toThrow(HttpException);
    await expect(createIssue(request)).rejects.toMatchObject({
      response: {
        error: 'Network error',
        message: 'Unable to connect to GitHub API',
      },
      status: 500,
    });
  });
});
