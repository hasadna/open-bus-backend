/**
 * Create a mock Fastify reply object
 */
export function createMockReply() {
  const reply = {
    send(data: any) {
      this.sendCalledWith = data;
      return this;
    },
    sendCalledWith: null as any,
    status(code: number) {
      this.statusCalledWith = code;
      return this;
    },
    statusCalledWith: null as number | null,
  };

  // Bind methods to ensure proper context
  reply.send = reply.send.bind(reply);
  reply.status = reply.status.bind(reply);

  return reply;
}

/**
 * Create a mock Fastify request object
 */
export function createMockRequest(body = {}, params = {}, query = {}) {
  return {
    body,
    log: {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
    params,
    query,
  };
}

/**
 * Create a mock GitHub API response
 */
export function createMockGitHubResponse(id = 123, title = 'Test Issue', state = 'open') {
  return {
    data: {
      created_at: new Date().toISOString(),
      html_url: `https://github.com/test/repo/issues/${id}`,
      id,
      number: id,
      state,
      title,
      updated_at: new Date().toISOString(),
    },
  };
}

/**
 * Create a mock GitHub API error
 */
export function createMockGitHubError(status = 500, message = 'Internal Server Error') {
  const error = new Error(message);

  (error as any).response = {
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
      info: jest.fn(),
      error: jest.fn(),
    },
    close: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Set up GitHub environment variables for testing
 */
export function setupGitHubEnv(env = {}) {
  const defaults = {
    GITHUB_OWNER: 'fake-owner',
    GITHUB_REPO: 'fake-repo',
    GITHUB_TOKEN: 'fake-token',
  };
  const testEnv = { ...defaults, ...env };

  Object.entries(testEnv).forEach(([key, value]) => {
    if (value == null) {
      process.env[key] = undefined;
    } else {
      process.env[key] = value;
    }
  });
}

/**
 * Restore all Jest mocks and restore original environment
 */
export function cleanup() {
  jest.restoreAllMocks();
}

/**
 * Create a sandbox for isolated test mocks
 */
export function createSandbox() {
  return jest.fn();
}

describe('test utils', () => {
  it('should export functions', () => {
    expect(typeof createMockReply).toBe('function');
    expect(typeof createMockRequest).toBe('function');
  });
});
