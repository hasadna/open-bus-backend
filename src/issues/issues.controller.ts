import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import axios from 'axios';
import { CreateIssue, CreateIssueResponse } from './issues.dto';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  @Post('create')
  @ApiOperation({ summary: 'Create issue' })
  @ApiResponse({ status: 200, description: 'Issue created successfully', type: CreateIssueResponse })
  async createIssue(@Body() body: CreateIssue) {
    try {
      const { title, contactName, description, environment, expectedBehavior, actualBehavior, reproducibility, attachments, debug } = body;

      const issueBody = `## Contact Information\n**Contact Name:** ${contactName}\n**Contact Email:** \*\*\*\n\n## Issue Details\n**Description:** \n${description}\n\n**Environment:** ${environment}\n\n**Expected Behavior:** \n${expectedBehavior}\n\n**Actual Behavior:** \n${actualBehavior}\n\n**Reproducibility:** ${reproducibility}\n\n${attachments && attachments.length > 0 ? `## Attachments\n${attachments.map((url) => `- ${url}`).join('\n')}` : ''}\n\n---\n*Issue created via API on ${new Date().toISOString()}*`;
      const labels = ['REPORTED-BY-USER'];

      if (debug) {
        return {
          success: true,
          data: {
            stats: 'open',
            url: 'https://github.com/hasadna/open-bus-map-search',
            userId: '1234',
          },
        } as CreateIssueResponse;
      }

      const repoName = process.env.GITHUB_REPO;
      const repoOwner = process.env.GITHUB_OWNER;
      const token = process.env.GITHUB_TOKEN;

      if (!token || !repoOwner || !repoName) {
        throw new HttpException({ error: 'Configuration error', message: 'GitHub configuration is incomplete' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const response = await axios.post(
        `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
        { title, body: issueBody, labels },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'OpenBus-Backend/1.0',
          },
          timeout: 30000,
        },
      );

      return { success: true, data: response.data };
    } catch (error) {
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          throw new HttpException(
            {
              error: 'Authentication failed',
              message: 'Invalid GitHub token or insufficient permissions',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
        if (status === 404) {
          throw new HttpException(
            {
              error: 'Repository not found',
              message: 'The specified GitHub repository does not exist or is not accessible',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        if (status === 422) {
          throw new HttpException(
            {
              error: 'Invalid issue data',
              message: 'The issue data provided is invalid or contains errors',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          {
            error: 'GitHub API error',
            message: `Status: ${status} - ${error.response.statusText}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new HttpException(
          {
            error: 'Request timeout',
            message: 'The GitHub API request timed out',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new HttpException(
          {
            error: 'Network error',
            message: 'Unable to connect to GitHub API',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred while creating the issue',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
