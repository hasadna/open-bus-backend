import { commonSuccessResponse, S } from './index.js';

export const githubUserModel = S.object()
  .id('GithubUserModel')
  .description('A GitHub user.')
  .prop('name', S.anyOf([S.null(), S.string()]))
  .prop('email', S.anyOf([S.null(), S.string()]))
  .prop('login', S.string().examples(['octocat']))
  .prop('id', S.integer().examples([1]))
  .prop('node_id', S.string().examples(['MDQ6VXNlcjE=']))
  .prop('avatar_url', S.string().format('uri'))
  .prop('gravatar_id', S.anyOf([S.null(), S.string()]))
  .prop('url', S.string().format('uri'))
  .prop('html_url', S.string().format('uri'))
  .prop('followers_url', S.string().format('uri'))
  .prop('following_url', S.string())
  .prop('gists_url', S.string())
  .prop('starred_url', S.string())
  .prop('subscriptions_url', S.string().format('uri'))
  .prop('organizations_url', S.string().format('uri'))
  .prop('repos_url', S.string().format('uri'))
  .prop('events_url', S.string())
  .prop('received_events_url', S.string().format('uri'))
  .prop('type', S.string().examples(['User']))
  .prop('site_admin', S.boolean())
  .prop('starred_at', S.anyOf([S.null(), S.string().format('date-time')]))
  .prop('user_view_type', S.anyOf([S.null(), S.string()]))
  .additionalProperties(true);

export const githubMilestoneModel = S.object()
  .id('GithubMilestoneModel')
  .description('A collection of related issues and pull requests.')
  .prop('url', S.string().format('uri'))
  .prop('html_url', S.string().format('uri'))
  .prop('labels_url', S.string().format('uri'))
  .prop('id', S.integer())
  .prop('node_id', S.string())
  .prop('number', S.integer().description('The number of the milestone.'))
  .prop('state', S.string().enum(['open', 'closed']).default('open'))
  .prop('title', S.string())
  .prop('description', S.anyOf([S.null(), S.string()]))
  .prop('creator', S.anyOf([S.null(), S.ref('GithubUserModel')]))
  .prop('open_issues', S.integer())
  .prop('closed_issues', S.integer())
  .prop('created_at', S.string().format('date-time'))
  .prop('updated_at', S.string().format('date-time'))
  .prop('closed_at', S.anyOf([S.null(), S.string().format('date-time')]))
  .prop('due_on', S.anyOf([S.null(), S.string().format('date-time')]))
  .additionalProperties(true);

export const githubIssueModel = S.object()
  .id('GithubIssueModel')
  .description('A GitHub issue, which may represent a task, enhancement, bug, or pull request.')
  .prop('id', S.integer())
  .prop('node_id', S.string())
  .prop('url', S.string().format('uri'))
  .prop('repository_url', S.string().format('uri'))
  .prop('labels_url', S.string())
  .prop('comments_url', S.string().format('uri'))
  .prop('events_url', S.string().format('uri'))
  .prop('html_url', S.string().format('uri'))
  .prop('number', S.integer())
  .prop('state', S.string().enum(['open', 'closed']))
  .prop('state_reason', S.anyOf([S.null(), S.string().enum(['completed', 'reopened', 'not_planned'])]))
  .prop('title', S.string())
  .prop('body', S.anyOf([S.null(), S.string()]))
  .prop('user', S.anyOf([S.null(), S.ref('GithubUserModel')]))
  .prop(
    'labels',
    S.array().items(
      S.anyOf([
        S.string(),
        S.object()
          .prop('id', S.integer())
          .prop('node_id', S.string())
          .prop('url', S.string().format('uri'))
          .prop('name', S.string())
          .prop('description', S.anyOf([S.null(), S.string()]))
          .prop('color', S.anyOf([S.null(), S.string()]))
          .prop('default', S.boolean())
          .additionalProperties(true),
      ]),
    ),
  )
  .prop('assignee', S.anyOf([S.null(), S.ref('GithubUserModel')]))
  .prop('assignees', S.anyOf([S.null(), S.array().items(S.ref('GithubUserModel'))]))
  .prop('milestone', S.anyOf([S.null(), S.ref('GithubMilestoneModel')]))
  .prop('locked', S.boolean())
  .prop('active_lock_reason', S.anyOf([S.null(), S.string()]))
  .prop('comments', S.integer())
  .prop(
    'pull_request',
    S.object()
      .prop('merged_at', S.anyOf([S.null(), S.string().format('date-time')]))
      .prop('diff_url', S.anyOf([S.null(), S.string().format('uri')]))
      .prop('html_url', S.anyOf([S.null(), S.string().format('uri')]))
      .prop('patch_url', S.anyOf([S.null(), S.string().format('uri')]))
      .prop('url', S.anyOf([S.null(), S.string().format('uri')]))
      .additionalProperties(true),
  )
  .prop('closed_at', S.anyOf([S.null(), S.string().format('date-time')]))
  .prop('created_at', S.string().format('date-time'))
  .prop('updated_at', S.string().format('date-time'))
  .prop('draft', S.boolean())
  .prop('closed_by', S.anyOf([S.null(), S.ref('GithubUserModel')]))
  .additionalProperties(true);

/**
 * Create issue endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const createIssueSchema = {
  tags: ['Issues'],
  summary: 'Create a GitHub issue',
  description: 'Creates a new GitHub issue with the provided information',
  body: S.object()
    .prop('type', S.string().enum(['bug', 'feature', 'other']).description('Type of the issue'))
    .prop('title', S.string().minLength(5).maxLength(200).description('Title of the issue'))
    .prop('contactName', S.string().minLength(1).maxLength(100).description('Name of the person reporting the issue'))
    .prop('contactEmail', S.string().format('email').description('Email of the person reporting the issue'))
    .prop('description', S.string().minLength(10).maxLength(5000).description('Detailed description of the issue'))
    .prop('environment', S.string().minLength(1).maxLength(200).description('Environment where the issue occurred'))
    .prop('expectedBehavior', S.string().minLength(5).maxLength(1000).description('What was expected to happen'))
    .prop('actualBehavior', S.string().minLength(5).maxLength(1000).description('What actually happened'))
    .prop('reproducibility', S.string().enum(['always', 'sometimes', 'rarely', 'once']).description('How often the issue can be reproduced'))
    // .prop('attachments', S.array().items(S.object()))
    .required([
      'type',
      'title',
      'contactName',
      'contactEmail',
      'description',
      'environment',
      'expectedBehavior',
      'actualBehavior',
      'reproducibility',
    ]),
  response: {
    200: commonSuccessResponse(S.ref('GithubIssueModel')),
    400: S.ref('ErrorResponseModel'),
    401: S.ref('ErrorResponseModel'),
    500: S.ref('ErrorResponseModel'),
  },
};

/**
 * Create issue endpoint schema (deprecated)
 * @type {import('fastify').FastifySchema}
 */
export const createIssueDepractedSchema = {
  tags: ['Issues'],
  summary: 'Create a GitHub issue (deprecated)',
  description: 'Creates a new GitHub issue with the provided information (deprecated)',
  body: createIssueSchema.body,
  response: createIssueSchema.response,
};
