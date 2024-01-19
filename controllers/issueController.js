const axios = require('axios');

const createIssue = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      title,
      contactName,
      contactEmail,
      description,
      environment,
      expectedBehavior,
      actualBehavior,
      reproducibility,
      attachments,
    } = req.body;

    // Create the body for the GitHub issue
    const body = `\n
    **Contact Name:** ${contactName}\n
    **Contact Email:** ${contactEmail}\n
    **Description:** \n${description}\n
    **Environment:** ${environment}\n
    **Expected Behavior:** \n${expectedBehavior}\n
    **Actual Behavior:** \n${actualBehavior}\n
    **Reproducibility:** ${reproducibility}\n
    `;

    // GitHub issue label
    const labels = ['REPORTED-BY-USER'];

    // GitHub API configuration
    const token =
      process.env.GITHUB_TOKEN; // Replace with the actual GitHub token
    const repoOwner = process.env.GITHUB_OWNER; // Replace with the actual owner of the repository
    const repoName = process.env.GITHUB_REPO; // Replace with the actual repository name

    // Create the GitHub issue
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
      { title, body, labels },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createIssue };
