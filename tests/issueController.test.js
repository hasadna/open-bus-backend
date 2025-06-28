import { expect } from 'chai'
import sinon from 'sinon'

import { createIssue } from '../src/controllers/issueController.js'
import {
  createMockReply,
  createMockRequest,
  createMockHttpClient,
  createMockGitHubResponse,
  createMockGitHubError,
  setupGitHubEnv,
  cleanup,
} from './test-utils.js'

describe('createIssue', () => {
  let request, reply, mockHttpClient

  beforeEach(() => {
    request = createMockRequest({
      title: 'Test Issue',
      contactName: 'John Doe',
      contactEmail: 'john@example.com',
      description: 'Test description',
      environment: 'Test environment',
      expectedBehavior: 'Should work',
      actualBehavior: 'Does not work',
      reproducibility: 'Always',
      attachments: [],
    })

    reply = createMockReply()
    mockHttpClient = createMockHttpClient()
    setupGitHubEnv()
  })

  afterEach(() => {
    cleanup()
  })

  it('should create a GitHub issue and return the response data', async () => {
    const mockResponse = createMockGitHubResponse(123, 'Test Issue')
    mockHttpClient.post.resolves(mockResponse)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.sendCalledWith.success).to.equal(true)
    expect(reply.sendCalledWith.data).to.deep.equal(mockResponse.data)
    expect(reply.sendCalledWith.timestamp).to.be.a('string')
    expect(reply.statusCalledWith).to.equal(200)
    expect(mockHttpClient.post.calledOnce).to.be.true
  })

  it('should handle errors and return 500', async () => {
    const error = new Error('GitHub error')
    error.code = undefined
    mockHttpClient.post.rejects(error)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.statusCalledWith).to.equal(500)
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the issue',
    })
  })

  it('should handle 401 Unauthorized from GitHub API', async () => {
    const error = createMockGitHubError(401, 'Unauthorized')
    mockHttpClient.post.rejects(error)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.statusCalledWith).to.equal(401)
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Authentication failed',
      message: 'Invalid GitHub token or insufficient permissions',
    })
  })

  it('should send correct payload to GitHub API', async () => {
    const mockResponse = createMockGitHubResponse(1, 'Test Issue')
    mockHttpClient.post.resolves(mockResponse)

    await createIssue(request, reply, mockHttpClient)

    expect(mockHttpClient.post.calledOnce).to.be.true

    const [url, payload, config] = mockHttpClient.post.firstCall.args
    expect(url).to.equal('https://api.github.com/repos/fake-owner/fake-repo/issues')
    expect(payload.title).to.equal('Test Issue')
    expect(payload.labels).to.deep.equal(['REPORTED-BY-USER'])
    expect(payload.body).to.include('**Contact Name:** John Doe')
    expect(config.headers.Authorization).to.equal('Bearer fake-token')
    expect(config.headers['Content-Type']).to.equal('application/json')
  })

  it('should work with missing optional fields', async () => {
    request.body.attachments = undefined
    request.body.environment = undefined
    request.body.expectedBehavior = undefined
    request.body.actualBehavior = undefined
    request.body.reproducibility = undefined

    const mockResponse = createMockGitHubResponse(123, 'Test Issue')
    mockHttpClient.post.resolves(mockResponse)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.sendCalledWith).to.have.property('success', true)
    expect(reply.sendCalledWith.data).to.have.property('id', 123)
  })

  it('should handle missing GitHub env variables gracefully', async () => {
    setupGitHubEnv({
      GITHUB_TOKEN: undefined,
      GITHUB_OWNER: undefined,
      GITHUB_REPO: undefined,
    })

    await createIssue(request, reply, mockHttpClient)

    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Configuration error',
      message: 'GitHub configuration is incomplete',
    })
  })

  it('should handle 404 Repository not found', async () => {
    const error = createMockGitHubError(404, 'Not Found')
    mockHttpClient.post.rejects(error)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.statusCalledWith).to.equal(500)
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Repository not found',
      message: 'The specified GitHub repository does not exist or is not accessible',
    })
  })

  it('should handle 422 Validation error', async () => {
    const error = createMockGitHubError(422, 'Validation Failed')
    mockHttpClient.post.rejects(error)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.statusCalledWith).to.equal(400)
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Invalid issue data',
      message: 'The issue data provided is invalid or contains errors',
    })
  })

  it('should handle network timeout errors', async () => {
    const error = new Error('timeout of 30000ms exceeded')
    error.code = 'ECONNABORTED'
    mockHttpClient.post.rejects(error)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.statusCalledWith).to.equal(500)
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Request timeout',
      message: 'The GitHub API request timed out',
    })
  })

  it('should handle network connection errors', async () => {
    const error = new Error('getaddrinfo ENOTFOUND api.github.com')
    error.code = 'ENOTFOUND'
    mockHttpClient.post.rejects(error)

    await createIssue(request, reply, mockHttpClient)

    expect(reply.statusCalledWith).to.equal(500)
    expect(reply.sendCalledWith).to.deep.equal({
      error: 'Network error',
      message: 'Unable to connect to GitHub API',
    })
  })
})
