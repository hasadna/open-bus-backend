/**
 * Create issue endpoint schema
 * @type {import('fastify').FastifySchema}
 */
export const createIssueSchema = {
  tags: ['Issues'],
  summary: 'Create a GitHub issue',
  description: 'Creates a new GitHub issue with the provided information',
  body: {
    type: 'object',
    required: [
      'title',
      'contactName',
      'contactEmail',
      'description',
      'environment',
      'expectedBehavior',
      'actualBehavior',
      'reproducibility',
    ],
    properties: {
      title: {
        type: 'string',
        description: 'Title of the issue',
        minLength: 5,
        maxLength: 200,
      },
      contactName: {
        type: 'string',
        description: 'Name of the person reporting the issue',
        minLength: 1,
        maxLength: 100,
      },
      contactEmail: {
        type: 'string',
        format: 'email',
        description: 'Email of the person reporting the issue',
      },
      description: {
        type: 'string',
        description: 'Detailed description of the issue',
        minLength: 10,
        maxLength: 5000,
      },
      environment: {
        type: 'string',
        description: 'Environment where the issue occurred',
        minLength: 1,
        maxLength: 200,
      },
      expectedBehavior: {
        type: 'string',
        description: 'What was expected to happen',
        minLength: 5,
        maxLength: 1000,
      },
      actualBehavior: {
        type: 'string',
        description: 'What actually happened',
        minLength: 5,
        maxLength: 1000,
      },
      reproducibility: {
        type: 'string',
        description: 'How often the issue can be reproduced',
        enum: ['always', 'sometimes', 'rarely', 'once'],
      },
      attachments: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uri',
        },
        description: 'Optional attachments (file URLs)',
        maxItems: 10,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            number: { type: 'number' },
            title: { type: 'string' },
            body: { type: 'string' },
            state: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            closed_at: { type: 'string', format: 'date-time' },
            labels: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'object' },
      },
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};
