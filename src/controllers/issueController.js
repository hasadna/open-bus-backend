import axios from 'axios';

/**
 * Helper to send error responses and log them
 * @param {import('fastify').FastifyReply} reply
 * @param {import('fastify').FastifyRequest} request
 * @param {number} status
 * @param {object} payload
 * @param {string} logMsg
 * @param {object} [logObj]
 */
function sendError(reply, request, status, payload, logMsg, logObj = {}) {
  request?.log?.error?.(logMsg, logObj);

  return reply.status(status).send(payload);
}

/**
 * Create issue handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 * @param {object} [httpClient=axios] - HTTP client for GitHub API
 */
export async function createIssue(request, reply, httpClient = axios) {
  const logger = request?.log || { info: () => {}, error: () => {} };

  try {
    const { title, contactName, contactEmail, description, environment, expectedBehavior, actualBehavior, reproducibility, attachments } =
      request.body;

    logger.info('GitHub issue creation started', {
      title,
      contactEmail,
      reproducibility,
    });

    // Validate required environment variables
    const token = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_OWNER;
    const repoName = process.env.GITHUB_REPO;

    if (!token || !repoOwner || !repoName) {
      return sendError(
        reply,
        request,
        500,
        { error: 'Configuration error', message: 'GitHub configuration is incomplete' },
        'Missing GitHub configuration',
        { hasToken: Boolean(token), hasOwner: Boolean(repoOwner), hasRepo: Boolean(repoName) },
      );
    }

    // Create the body for the GitHub issue
    const body = `## Contact Information\n**Contact Name:** ${contactName}\n**Contact Email:** ${contactEmail}\n\n## Issue Details\n**Description:** \n${description}\n\n**Environment:** ${environment}\n\n**Expected Behavior:** \n${expectedBehavior}\n\n**Actual Behavior:** \n${actualBehavior}\n\n**Reproducibility:** ${reproducibility}\n\n${attachments && attachments.length > 0 ? `## Attachments\n${attachments.map((url) => `- ${url}`).join('\n')}` : ''}\n\n---\n*Issue created via API on ${new Date().toISOString()}*`;
    const labels = ['REPORTED-BY-USER'];

    // Create the GitHub issue
    const response = await httpClient.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
      { title, body, labels },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'OpenBus-Backend/1.0',
        },
        timeout: 30000,
      },
    );

    logger.info('GitHub issue created successfully', {
      issueNumber: response.data.number,
      issueId: response.data.id,
    });

    return reply.status(200).send({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('GitHub issue creation failed', {
      error: error.message,
      stack: error.stack,
      body: request.body,
    });

    // Handle validation errors
    if (error.validation) {
      return sendError(
        reply,
        request,
        400,
        {
          error: 'Validation failed',
          details: error.validation,
        },
        'Validation failed',
        { validation: error.validation },
      );
    }

    // Handle GitHub API errors
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        return sendError(
          reply,
          request,
          401,
          {
            error: 'Authentication failed',
            message: 'Invalid GitHub token or insufficient permissions',
          },
          'GitHub authentication failed',
        );
      }
      if (status === 404) {
        return sendError(
          reply,
          request,
          500,
          {
            error: 'Repository not found',
            message: 'The specified GitHub repository does not exist or is not accessible',
          },
          'GitHub repository not found',
        );
      }
      if (status === 422) {
        return sendError(
          reply,
          request,
          400,
          {
            error: 'Invalid issue data',
            message: 'The issue data provided is invalid or contains errors',
          },
          'GitHub issue validation failed',
        );
      }

      return sendError(
        reply,
        request,
        500,
        {
          error: 'GitHub API error',
          message: `Status: ${status} - ${error.response.statusText}`,
        },
        'GitHub API error',
        { status, statusText: error.response.statusText },
      );
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return sendError(
        reply,
        request,
        500,
        {
          error: 'Request timeout',
          message: 'The GitHub API request timed out',
        },
        'GitHub API request timeout',
      );
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return sendError(
        reply,
        request,
        500,
        {
          error: 'Network error',
          message: 'Unable to connect to GitHub API',
        },
        'GitHub API network error',
        { code: error.code },
      );
    }

    return sendError(
      reply,
      request,
      500,
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the issue',
      },
      'Unexpected error in createIssue',
    );
  }
}
