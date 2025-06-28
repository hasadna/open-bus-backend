import axios from 'axios'

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
