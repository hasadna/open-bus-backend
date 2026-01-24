import ky from 'ky';

/**
 * Fetches a reference number and GUID from the API.
 * @returns {Promise<{ref: string, guid: string}>} Promise resolving to an object with ref and guid.
 * @throws {Error} If credentials are missing, HTTP request fails, or JSON parsing fails.
 */
export async function getReferenceNumber() {
  if (!process.env.AWS_API_KEY || !process.env.AWS_APP_ID || !process.env.AWS_REGION) {
    throw new Error('Missing AWS credentials');
  }

  try {
    const url = `https://${process.env.AWS_APP_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/prod`;
    const response = await ky.get(url, {
      headers: { 'x-api-key': process.env.AWS_API_KEY },
      timeout: 30000,
    });

    const data = await response.json();
    if (!data.ref || !data.guid) {
      throw new Error('Failed to get Reference Number');
    }
    return data;
  } catch (error) {
    throw new Error('Failed to get Reference Number', { cause: error });
  }
}
