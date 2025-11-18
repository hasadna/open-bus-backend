import ky from 'ky';

import { maskEmail } from '../utils/maskEmail.js';

/**
 * Create issue handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function createIssue(request, reply) {
  try {
    const { title, contactName, contactEmail, description, environment, expectedBehavior, actualBehavior, reproducibility, attachments, debug } =
      request.body;

    if (debug === true) {
      request.log.info('Debug mode: returning fake GitHub issue data');
      return reply.status(200).send({
        success: true,
        data: {
          number: 1347,
          id: 123456,
          title: title || 'Fake Issue',
          body: 'Fake issue body for debugging',
          labels: ['REPORTED-BY-USER'],
          state: 'open',
          created_at: new Date().toISOString(),
          url: 'https://api.github.com/repos/octocat/Hello-World/issues/1347',
          html_url: 'https://github.com/octocat/Hello-World/issues/1347',
        },
      });
    }

    const maskedEmail = maskEmail(contactEmail);
    request.log.info('GitHub issue creation started', { title, contactEmail: maskedEmail, reproducibility });

    // Validate required environment variables
    const repoName = process.env.GITHUB_REPO;
    const repoOwner = process.env.GITHUB_OWNER;
    const token = process.env.GITHUB_TOKEN;

    if (!token || !repoOwner || !repoName) {
      request?.log?.error?.('Missing GitHub configuration', { hasToken: Boolean(token), hasOwner: Boolean(repoOwner), hasRepo: Boolean(repoName) });
      return reply.status(500).send({ error: 'Configuration error', message: 'GitHub configuration is incomplete' });
    }

    // Create the body for the GitHub issue
    const body = `## Contact Information\n**Contact Name:** ${contactName}\n**Contact Email:** ${maskedEmail}\n\n## Issue Details\n**Description:** \n${description}\n\n**Environment:** ${environment}\n\n**Expected Behavior:** \n${expectedBehavior}\n\n**Actual Behavior:** \n${actualBehavior}\n\n**Reproducibility:** ${reproducibility}\n\n${attachments && attachments.length > 0 ? `## Attachments\n${attachments.map((url) => `- ${url}`).join('\n')}` : ''}\n\n---\n*Issue created via API on ${new Date().toISOString()}*`;
    const labels = ['REPORTED-BY-USER'];
    // Create the GitHub issue
    const response = await ky.post(
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

    request.log.info('GitHub issue created successfully', {
      issueNumber: response.data.number,
      issueId: response.data.id,
    });

    return reply.status(200).send({ success: true, data: response.data });
  } catch (error) {
    request.log.error('GitHub issue creation failed', {
      error: error.message,
      stack: error.stack,
      body: request.body,
    });

    // Handle validation errors
    if (error.validation) {
      request?.log?.error?.('Validation failed', { validation: error.validation });
      return reply.status(400).send({
        error: 'Validation failed',
        details: error.validation,
      });
    }

    // Handle GitHub API errors
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        request?.log?.error?.('GitHub authentication failed');
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Invalid GitHub token or insufficient permissions',
        });
      }
      if (status === 404) {
        request?.log?.error?.('GitHub repository not found');
        return reply.status(500).send({
          error: 'Repository not found',
          message: 'The specified GitHub repository does not exist or is not accessible',
        });
      }
      if (status === 422) {
        request?.log?.error?.('GitHub issue validation failed');
        return reply.status(400).send({
          error: 'Invalid issue data',
          message: 'The issue data provided is invalid or contains errors',
        });
      }

      request?.log?.error?.('GitHub API error', { status, statusText: error.response.statusText });
      return reply.status(500).send({
        error: 'GitHub API error',
        message: `Status: ${status} - ${error.response.statusText}`,
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      request?.log?.error?.('GitHub API request timeout');
      return reply.status(500).send({
        error: 'Request timeout',
        message: 'The GitHub API request timed out',
      });
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      request?.log?.error?.('GitHub API network error', { code: error.code });
      return reply.status(500).send({
        error: 'Network error',
        message: 'Unable to connect to GitHub API',
      });
    }

    request?.log?.error?.('Unexpected error in createIssue');
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the issue',
    });
  }
}
