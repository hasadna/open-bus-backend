import { S } from './index.js';

/**
 * Create issue endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const createIssueSchema = {
  tags: ['Issues'],
  summary: 'Create a GitHub issue',
  description: 'Creates a new GitHub issue with the provided information',
  body: S.object()
    .prop('title', S.string().minLength(5).maxLength(200).description('Title of the issue'))
    .prop('contactName', S.string().minLength(1).maxLength(100).description('Name of the person reporting the issue'))
    .prop('contactEmail', S.string().format('email').description('Email of the person reporting the issue'))
    .prop('description', S.string().minLength(10).maxLength(5000).description('Detailed description of the issue'))
    .prop('environment', S.string().minLength(1).maxLength(200).description('Environment where the issue occurred'))
    .prop('expectedBehavior', S.string().minLength(5).maxLength(1000).description('What was expected to happen'))
    .prop('actualBehavior', S.string().minLength(5).maxLength(1000).description('What actually happened'))
    .prop('reproducibility', S.string().enum(['always', 'sometimes', 'rarely', 'once']).description('How often the issue can be reproduced'))
    .prop('attachments', S.array().items(S.string().format('uri')).maxItems(10).description('Optional attachments (file URLs)'))
    .required(['title', 'contactName', 'contactEmail', 'description', 'environment', 'expectedBehavior', 'actualBehavior', 'reproducibility']),
  response: {
    200: S.object()
      .prop('success', S.boolean())
      .prop(
        'data',
        S.object()
          .prop('id', S.number())
          .prop('number', S.number())
          .prop('title', S.string())
          .prop('body', S.string())
          .prop('state', S.string())
          .prop('created_at', S.string().format('date-time'))
          .prop('updated_at', S.string().format('date-time'))
          .prop('closed_at', S.string().format('date-time'))
          .prop('labels', S.array().items(S.object().prop('id', S.number()).prop('name', S.string()).prop('color', S.string()))),
      ),
    400: S.object().prop('error', S.string()).prop('details', S.object()),
    401: S.object().prop('error', S.string()).prop('message', S.string()),
    500: S.object().prop('error', S.string()).prop('message', S.string()),
  },
};
