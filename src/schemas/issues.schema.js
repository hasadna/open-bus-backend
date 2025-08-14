import { commonSuccessResponse, S } from './index.js';

const antdUploadFileSchema = S.object()
  .title('Antd UploadFile')
  .description("A file object used by Ant Design's Upload component.")
  .prop('uid', S.string().required().description('Unique ID of the file.'))
  .prop('name', S.string().required().description('Name of the file.'))
  .prop('size', S.number().description('Size of the file in bytes.'))
  .prop('url', S.string().format('uri').description('The URL of the file.'))
  .prop('status', S.string().enum(['uploading', 'done', 'error', 'removed']).description('The status of the file.'))
  .prop('percent', S.number().minimum(0).maximum(100).description('Upload progress percentage.'))
  .prop('type', S.string().description('MIME type of the file.'));

export const issueSchema = S.object()
  .id('Issue')
  .description('Issues are a great way to keep track of tasks, enhancements, and bugs for your projects.')
  .prop('id', S.integer().format('int64'))
  .prop('node_id', S.string())
  .prop('url', S.string().format('uri').description('URL for the issue').examples(['https://api.github.com/repositories/42/issues/1']))
  .prop('repository_url', S.string().format('uri'))
  .prop('labels_url', S.string())
  .prop('comments_url', S.string().format('uri'))
  .prop('events_url', S.string().format('uri'))
  .prop('html_url', S.string().format('uri'))
  .prop('number', S.integer().description('Number uniquely identifying the issue within its repository').examples([42]))
  .prop('state', S.string().description("State of the issue; either 'open' or 'closed'").examples(['open']))
  .prop(
    'state_reason',
    S.string()
      .raw({ type: ['string', 'null'] })
      .enum(['completed', 'reopened', 'not_planned', null])
      .description('The reason for the current state')
      .examples(['not_planned']),
  )
  .prop('title', S.string().description('Title of the issue').examples(['Widget creation fails in Safari on OS X 10.8']))
  .prop(
    'body',
    S.string()
      .raw({ type: ['string', 'null'] })
      .description('Contents of the issue')
      .examples([
        'It looks like the new widget form is broken on Safari. When I try and create the widget, Safari crashes. This is reproducible on 10.8, but not 10.9. Maybe a browser bug?',
      ]),
  )
  .prop('user', S.anyOf([S.null(), S.object()]))
  .prop(
    'labels',
    S.array()
      .items(
        S.anyOf([
          S.string(),
          S.object()
            .prop('id', S.integer().format('int64'))
            .prop('node_id', S.string())
            .prop('url', S.string().format('uri'))
            .prop('name', S.string())
            .prop('description', S.string().raw({ type: ['string', 'null'] }))
            .prop('color', S.string().raw({ type: ['string', 'null'] }))
            .prop('default', S.boolean()),
        ]),
      )
      .description(
        'Labels to associate with this issue; pass one or more label names to replace the set of labels on this issue; send an empty array to clear all labels from the issue; note that the labels are silently dropped for users without push access to the repository',
      )
      .examples(['bug', 'registration']),
  )
  .prop('assignee', S.anyOf([S.null(), S.object()]))
  .prop(
    'assignees',
    S.array()
      .raw({ type: ['array', 'null'] })
      .items(S.object()),
  )
  .prop('milestone', S.anyOf([S.null(), S.object()]))
  .prop('locked', S.boolean())
  .prop('active_lock_reason', S.string().raw({ type: ['string', 'null'] }))
  .prop('comments', S.integer())
  .prop(
    'pull_request',
    S.object()
      .prop(
        'merged_at',
        S.string()
          .raw({ type: ['string', 'null'] })
          .format('date-time'),
      )
      .prop(
        'diff_url',
        S.string()
          .raw({ type: ['string', 'null'] })
          .format('uri')
          .required(),
      )
      .prop(
        'html_url',
        S.string()
          .raw({ type: ['string', 'null'] })
          .format('uri')
          .required(),
      )
      .prop(
        'patch_url',
        S.string()
          .raw({ type: ['string', 'null'] })
          .format('uri')
          .required(),
      )
      .prop(
        'url',
        S.string()
          .raw({ type: ['string', 'null'] })
          .format('uri')
          .required(),
      )
      .required(['diff_url', 'html_url', 'patch_url', 'url']),
  )
  .prop(
    'closed_at',
    S.string()
      .raw({ type: ['string', 'null'] })
      .format('date-time'),
  )
  .prop('created_at', S.string().format('date-time'))
  .prop('updated_at', S.string().format('date-time'))
  .prop('draft', S.boolean())
  .prop('closed_by', S.anyOf([S.null(), S.object()]))
  .required([
    'id',
    'node_id',
    'url',
    'repository_url',
    'labels_url',
    'comments_url',
    'events_url',
    'html_url',
    'number',
    'state',
    'state_reason',
    'title',
    'body',
    'user',
    'labels',
    'assignee',
    'assignees',
    'milestone',
    'locked',
    'active_lock_reason',
    'comments',
    'pull_request',
    'closed_at',
    'created_at',
    'updated_at',
    'draft',
    'closed_by',
  ]);

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
    .items(S.ref(antdUploadFileSchema))
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
    200: commonSuccessResponse(S.ref(issueSchema)),
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
