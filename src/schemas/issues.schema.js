import { commonSuccessResponse, S } from './index.js';

export const githubIssueModel = S.object()
  .id('GithubIssueModel')
  .description('A GitHub issue, which may represent a task, enhancement, bug, or pull request.')
  .prop('id', S.integer())
  .prop('number', S.integer())
  .prop('title', S.string())
  .prop('body', S.anyOf([S.null(), S.string()]))
  .prop('labels', S.array().items(S.string()))
  .prop('state', S.string().enum(['open', 'closed']))
  .prop('created_at', S.string().format('date-time'))
  .prop('url', S.string().format('uri'))
  .prop('html_url', S.string().format('uri'))
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
    .prop('debug', S.boolean().default(false).examples([true]))
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
