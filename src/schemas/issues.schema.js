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

const simpleUserSchema = S.object()
  .id('Simple User')
  .description('A GitHub user.')
  .prop('name', S.string().raw({ type: ['string', 'null'] }))
  .prop('email', S.string().raw({ type: ['string', 'null'] }))
  .prop('login', S.string().examples(['octocat']).required())
  .prop('id', S.integer().format('int64').examples([1]).required())
  .prop('node_id', S.string().examples(['MDQ6VXNlcjE=']).required())
  .prop('avatar_url', S.string().format('uri').examples(['https://github.com/images/error/octocat_happy.gif']).required())
  .prop(
    'gravatar_id',
    S.string()
      .raw({ type: ['string', 'null'] })
      .examples(['41d064eb2195891e12d0413f63227ea7'])
      .required(),
  )
  .prop('url', S.string().format('uri').examples(['https://api.github.com/users/octocat']).required())
  .prop('html_url', S.string().format('uri').examples(['https://github.com/octocat']).required())
  .prop('followers_url', S.string().format('uri').examples(['https://api.github.com/users/octocat/followers']).required())
  .prop('following_url', S.string().examples(['https://api.github.com/users/octocat/following{/other_user}']).required())
  .prop('gists_url', S.string().examples(['https://api.github.com/users/octocat/gists{/gist_id}']).required())
  .prop('starred_url', S.string().examples(['https://api.github.com/users/octocat/starred{/owner}{/repo}']).required())
  .prop('subscriptions_url', S.string().format('uri').examples(['https://api.github.com/users/octocat/subscriptions']).required())
  .prop('organizations_url', S.string().format('uri').examples(['https://api.github.com/users/octocat/orgs']).required())
  .prop('repos_url', S.string().format('uri').examples(['https://api.github.com/users/octocat/repos']).required())
  .prop('events_url', S.string().examples(['https://api.github.com/users/octocat/events{/privacy}']).required())
  .prop('received_events_url', S.string().format('uri').examples(['https://api.github.com/users/octocat/received_events']).required())
  .prop('type', S.string().examples(['User']).required())
  .prop('site_admin', S.boolean().required())
  .prop('starred_at', S.string().examples(['"2020-07-09T00:17:55Z"']))
  .prop('user_view_type', S.string().examples(['public']))
  .required([
    'avatar_url',
    'events_url',
    'followers_url',
    'following_url',
    'gists_url',
    'gravatar_id',
    'html_url',
    'id',
    'node_id',
    'login',
    'organizations_url',
    'received_events_url',
    'repos_url',
    'site_admin',
    'starred_url',
    'subscriptions_url',
    'type',
    'url',
  ]);

const milestoneSchema = S.object()
  .id('Milestone')
  .description('A collection of related issues and pull requests.')
  .prop('url', S.string().format('uri').examples(['https://api.github.com/repos/octocat/Hello-World/milestones/1']).required())
  .prop('html_url', S.string().format('uri').examples(['https://github.com/octocat/Hello-World/milestones/v1.0']).required())
  .prop('labels_url', S.string().format('uri').examples(['https://api.github.com/repos/octocat/Hello-World/milestones/1/labels']).required())
  .prop('id', S.integer().examples([1002604]).required())
  .prop('node_id', S.string().examples(['MDk6TWlsZXN0b25lMTAwMjYwNA==']).required())
  .prop('number', S.integer().description('The number of the milestone.').examples([42]).required())
  .prop('state', S.string().description('The state of the milestone.').enum(['open', 'closed']).default('open').examples(['open']).required())
  .prop('title', S.string().description('The title of the milestone.').examples(['v1.0']).required())
  .prop(
    'description',
    S.string()
      .raw({ type: ['string', 'null'] })
      .examples(['Tracking milestone for version 1.0'])
      .required(),
  )
  .prop('creator', S.anyOf([S.null(), S.ref(simpleUserSchema)]).required())
  .prop('open_issues', S.integer().examples([4]).required())
  .prop('closed_issues', S.integer().examples([8]).required())
  .prop('created_at', S.string().format('date-time').examples(['2011-04-10T20:09:31Z']).required())
  .prop('updated_at', S.string().format('date-time').examples(['2014-03-03T18:58:10Z']).required())
  .prop(
    'closed_at',
    S.string()
      .raw({ type: ['string', 'null'] })
      .format('date-time')
      .examples(['2013-02-12T13:22:01Z'])
      .required(),
  )
  .prop(
    'due_on',
    S.string()
      .raw({ type: ['string', 'null'] })
      .format('date-time')
      .examples(['2012-10-09T23:39:01Z'])
      .required(),
  )
  .required([
    'closed_issues',
    'creator',
    'description',
    'due_on',
    'closed_at',
    'id',
    'node_id',
    'labels_url',
    'html_url',
    'number',
    'open_issues',
    'state',
    'title',
    'url',
    'created_at',
    'updated_at',
  ]);

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
  .prop('user', S.anyOf([S.null(), S.ref(simpleUserSchema)]))
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
  .prop('assignee', S.anyOf([S.null(), S.ref(simpleUserSchema)]))
  .prop(
    'assignees',
    S.array()
      .raw({ type: ['array', 'null'] })
      .items(S.ref(simpleUserSchema)),
  )
  .prop('milestone', S.anyOf([S.null(), S.ref(milestoneSchema)]))
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
  .prop('closed_by', S.anyOf([S.null(), S.ref(simpleUserSchema)]))
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
    .prop('reproducibility', S.string().minLength(1).maxLength(100).description('How often the issue can be reproduced'))
    .items(S.anyOf([S.string().format('uri').description('A simple URL string for the attachment.'), S.ref(antdUploadFileSchema)]))
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
