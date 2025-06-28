import axios from 'axios'

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
      title: { type: 'string', description: 'Title of the issue' },
      contactName: { type: 'string', description: 'Name of the person reporting the issue' },
      contactEmail: { type: 'string', format: 'email', description: 'Email of the person reporting the issue' },
      description: { type: 'string', description: 'Detailed description of the issue' },
      environment: { type: 'string', description: 'Environment where the issue occurred' },
      expectedBehavior: { type: 'string', description: 'What was expected to happen' },
      actualBehavior: { type: 'string', description: 'What actually happened' },
      reproducibility: { type: 'string', description: 'How often the issue can be reproduced' },
      attachments: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional attachments (file URLs or base64 data)',
      },
    },
  },
  response: {
    200: {
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  },
}

/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function createIssue(request, reply, myAxios = axios) {
  try {
    // Extract data from the request body
    const { title, contactName, contactEmail, description, environment, expectedBehavior, actualBehavior, reproducibility, attachments } =
      request.body

    // Create the body for the GitHub issue
    const body = `\n
			**Contact Name:** ${contactName}
			**Description:** \n${description}
			**Environment:** ${environment}
			**Expected Behavior:** \n${expectedBehavior}
			**Actual Behavior:** \n${actualBehavior}
			**Reproducibility:** ${reproducibility}
			**Contact Email:** ${contactEmail}
		`

    // GitHub issue label
    const labels = ['REPORTED-BY-USER']

    // GitHub API configuration
    const token = process.env.GITHUB_TOKEN // Replace with the actual GitHub token
    const repoOwner = process.env.GITHUB_OWNER // Replace with the actual owner of the repository
    const repoName = process.env.GITHUB_REPO // Replace with the actual repository name

    // Create the GitHub issue
    const response = await myAxios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
      { title, body, labels },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    )

    return reply.status(200).send(response.data)
  } catch (error) {
    // console.error('Error creating GitHub issue:', error)
    return reply.status(500).send({ error: 'Internal Server Error' })
  }
}
