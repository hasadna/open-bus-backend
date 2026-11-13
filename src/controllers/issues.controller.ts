import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import ky, { isNetworkError } from 'ky';
import type { Static } from 'typebox';

import type { createIssueSchema, githubIssueModel } from '../schemas/issues.schema.js';

type IssueBody = Static<typeof createIssueSchema.body> & { attachments?: string[] };
type IssueError = Error & { validation?: FastifyError['validation']; response?: { status: number; statusText: string } };

export async function createIssue(request: FastifyRequest<{ Body: IssueBody }>, reply: FastifyReply) {
  try {
    const {
      title,
      contactName,
      contactEmail,
      publishContactEmail,
      description,
      environment,
      debugContext,
      expectedBehavior,
      actualBehavior,
      reproducibility,
      attachments,
      debug,
    } = request.body;

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

    // The email is posted only with the reporter's explicit consent; otherwise it is dropped.
    const publishedEmail = publishContactEmail === true && contactEmail ? contactEmail : undefined;
    request.log.info({ title, publishContactEmail: Boolean(publishedEmail), reproducibility }, 'GitHub issue creation started');

    // Validate required environment variables
    const repoName = process.env.GITHUB_REPO;
    const repoOwner = process.env.GITHUB_OWNER;
    const token = process.env.GITHUB_TOKEN;

    if (!token || !repoOwner || !repoName) {
      request?.log?.error?.({ hasToken: Boolean(token), hasOwner: Boolean(repoOwner), hasRepo: Boolean(repoName) }, 'Missing GitHub configuration');
      return reply.status(500).send({ error: 'Configuration error', message: 'GitHub configuration is incomplete' });
    }

    // Create the body for the GitHub issue
    const body = `## Contact Information\n**Contact Name:** ${contactName}\n${publishedEmail ? `**Contact Email:** ${publishedEmail}\n` : ''}\n## Issue Details\n**Description:** \n${description}\n\n**Environment:** ${environment}\n\n**Expected Behavior:** \n${expectedBehavior}\n\n**Actual Behavior:** \n${actualBehavior}\n\n**Reproducibility:** ${reproducibility}\n${debugContext ? `\n\n**Debug Context:** ${debugContext}` : ''}\n\n${attachments && attachments.length > 0 ? `## Attachments\n${attachments.map((url) => `- ${url}`).join('\n')}` : ''}\n\n---\n*Issue created via API on ${new Date().toISOString()}*`;
    const labels = ['REPORTED-BY-USER'];
    // Create the GitHub issue
    const response = await ky.post(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      json: { title, body, labels },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'OpenBus-Backend/1.0',
      },
      timeout: 30000,
    });
    const data = await response.json<Static<typeof githubIssueModel>>();

    request.log.info(
      {
        issueNumber: data.number,
        issueId: data.id,
      },
      'GitHub issue created successfully',
    );

    return reply.status(200).send({ success: true, data });
  } catch (caught) {
    const error: IssueError = caught instanceof Error ? caught : new Error(String(caught));
    request.log.error(
      {
        error: error.message,
        stack: error.stack,
        body: request.body,
      },
      'GitHub issue creation failed',
    );

    // Handle validation errors
    if (error.validation) {
      request?.log?.error?.({ validation: error.validation }, 'Validation failed');
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

      request?.log?.error?.({ status, statusText: error.response.statusText }, 'GitHub API error');
      return reply.status(500).send({
        error: 'GitHub API error',
        message: `Status: ${status} - ${error.response.statusText}`,
      });
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      request?.log?.error?.('GitHub API request timeout');
      return reply.status(500).send({
        error: 'Request timeout',
        message: 'The GitHub API request timed out',
      });
    }

    // Handle network errors
    if (isNetworkError(error)) {
      request?.log?.error?.({ name: error.name }, 'GitHub API network error');
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
