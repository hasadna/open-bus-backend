import sinon from 'sinon';

/**
 * Create a mock Fastify reply object
 */
export function createMockReply() {
  const reply = {
    sendCalledWith: null,
    statusCalledWith: null,
    send(data) {
      this.sendCalledWith = data;

      return this;
    },
    status(code) {
      this.statusCalledWith = code;

      return this;
    },
  };

  // Bind methods to ensure proper context
  reply.send = reply.send.bind(reply);
  reply.status = reply.status.bind(reply);

  return reply;
}

/**
 * Create a mock Fastify request object
 * @param {Object} body - Request body
 * @param {Object} params - Request parameters
 * @param {Object} query - Query parameters
 */
export function createMockRequest(body = {}, params = {}, query = {}) {
  return {
    body,
    params,
    query,
    log: {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
      debug: sinon.stub(),
    },
  };
}

/**
 * Create a mock HTTP client (axios-like)
 * @param {Object} responses - Map of URL patterns to responses
 */
export function createMockHttpClient(responses = {}) {
  const mockClient = {
    post: sinon.stub(),
    get: sinon.stub(),
  };

  // Set up default responses
  Object.entries(responses).forEach(([pattern, response]) => {
    if (pattern.includes('github')) {
      mockClient.post.withArgs(sinon.match(pattern)).resolves(response);
    } else {
      mockClient.get.withArgs(sinon.match(pattern)).resolves(response);
    }
  });

  return mockClient;
}

/**
 * Create a mock GitHub API response
 * @param {number} id - Issue ID
 * @param {string} title - Issue title
 * @param {string} state - Issue state
 */
export function createMockGitHubResponse(id = 123, title = 'Test Issue', state = 'open') {
  return {
    data: {
      id,
      number: id,
      title,
      state,
      html_url: `https://github.com/test/repo/issues/${id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

/**
 * Create a mock GitHub API error
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} Mock GitHub API error
 */
export function createMockGitHubError(status = 500, message = 'Internal Server Error') {
  const error = new Error(message);

  error.response = {
    status,
    statusText: message,
    data: { message },
  };

  return error;
}

/**
 * Set up GitHub environment variables for testing
 * @param {Object} env - Environment variables to set
 */
export function setupGitHubEnv(env = {}) {
  const defaults = {
    GITHUB_TOKEN: 'fake-token',
    GITHUB_OWNER: 'fake-owner',
    GITHUB_REPO: 'fake-repo',
  };

  const testEnv = { ...defaults, ...env };

  Object.entries(testEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
}

/**
 * Restore all Sinon stubs and restore original environment
 */
export function cleanup() {
  sinon.restore();
}

/**
 * Create a sandbox for isolated test stubs
 */
export function createSandbox() {
  return sinon.createSandbox();
}
