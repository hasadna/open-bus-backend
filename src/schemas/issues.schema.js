import { commonSuccessResponse, optionalObject, Type } from './index.js';

export const githubIssueModel = optionalObject(
  {
    id: Type.Integer(),
    number: Type.Integer(),
    title: Type.String(),
    body: Type.Union([Type.Null(), Type.String()]),
    labels: Type.Array(
      Type.Union([
        Type.String(),
        optionalObject(
          {
            id: Type.Integer(),
            node_id: Type.String(),
            url: Type.String({ format: 'uri' }),
            name: Type.String(),
            description: Type.Union([Type.Null(), Type.String()]),
            color: Type.Union([Type.Null(), Type.String()]),
            default: Type.Boolean(),
          },
          { additionalProperties: true },
        ),
      ]),
    ),
    state: Type.String({ enum: ['open', 'closed'] }),
    created_at: Type.String({ format: 'date-time' }),
    url: Type.String({ format: 'uri' }),
    html_url: Type.String({ format: 'uri' }),
  },
  {
    $id: 'GithubIssueModel',
    description: 'A GitHub issue, which may represent a task, enhancement, bug, or pull request.',
    additionalProperties: true,
  },
);

/**
 * Create issue endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const createIssueSchema = {
  tags: ['Issues'],
  summary: 'Create a GitHub issue',
  description: 'Creates a new GitHub issue with the provided information',
  body: Type.Object({
    type: Type.String({ enum: ['bug', 'feature', 'other'], description: 'Type of the issue' }),
    title: Type.String({ minLength: 5, maxLength: 200, description: 'Title of the issue' }),
    contactName: Type.String({ minLength: 1, maxLength: 100, description: 'Name of the person reporting the issue' }),
    contactEmail: Type.Optional(Type.String({ format: 'email', description: 'Email of the person reporting the issue' })),
    publishContactEmail: Type.Optional(
      Type.Boolean({
        default: false,
        description: 'Whether the reporter consented to publishing contactEmail in the public GitHub issue. Without it, the email is not posted.',
      }),
    ),
    description: Type.String({ minLength: 10, maxLength: 5000, description: 'Detailed description of the issue' }),
    environment: Type.String({ minLength: 1, maxLength: 200, description: 'Environment where the issue occurred' }),
    debugContext: Type.Optional(
      Type.String({ maxLength: 2000, description: 'Optional debug context URL, e.g. the page the user was on when reporting' }),
    ),
    expectedBehavior: Type.String({ minLength: 5, maxLength: 1000, description: 'What was expected to happen' }),
    actualBehavior: Type.String({ minLength: 5, maxLength: 1000, description: 'What actually happened' }),
    reproducibility: Type.String({ enum: ['always', 'sometimes', 'rarely', 'once'], description: 'How often the issue can be reproduced' }),
    debug: Type.Optional(Type.Boolean({ default: false, examples: [true] })),
  }),
  response: {
    200: commonSuccessResponse(Type.Ref('GithubIssueModel')),
    400: Type.Ref('ErrorResponseModel'),
    401: Type.Ref('ErrorResponseModel'),
    500: Type.Ref('ErrorResponseModel'),
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
