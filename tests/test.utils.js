import { restore, stub } from 'sinon';

/**
 * Create a mock Fastify reply object
 */
export function createMockReply() {
  const reply = {
    send(data) {
      this.sendCalledWith = data;

      return this;
    },
    sendCalledWith: null,
    status(code) {
      this.statusCalledWith = code;
      return this;
    },
    statusCalledWith: null,
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
    log: {
      debug: stub(),
      error: stub(),
      info: stub(),
      warn: stub(),
    },
    params,
    query,
  };
}

/**
 * Create a mock GitHub API response
 * @param {number} id - Issue ID
 * @param {string} title - Issue title
 * @param {string} state - Issue state
 */
export function createMockGitHubResponse(id = 123, title = 'Test Issue', state = 'open') {
  const data = {
    created_at: new Date().toISOString(),
    html_url: `https://github.com/test/repo/issues/${id}`,
    id,
    number: id,
    state,
    title,
    updated_at: new Date().toISOString(),
  };
  return {
    data,
    json: () => Promise.resolve(data),
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
    data: { message },
    status,
    statusText: message,
  };

  return error;
}

/**
 * Create a mock Fastify Server
 */
export function createFastifyMock() {
  return {
    log: {
      info: stub(),
      error: stub(),
    },
    close: stub().resolves(),
  };
}

/**
 * Set up GitHub environment variables for testing
 * @param {Object} env - Environment variables to set
 */
export function setupGitHubEnv(env = {}) {
  const defaults = {
    GITHUB_OWNER: 'fake-owner',
    GITHUB_REPO: 'fake-repo',
    GITHUB_TOKEN: 'fake-token',
  };
  const testEnv = { ...defaults, ...env };

  Object.entries(testEnv).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
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
  restore();
}

/**
 * Create a sandbox for isolated test stubs
 */
export function createSandbox() {
  return createSandbox();
}
