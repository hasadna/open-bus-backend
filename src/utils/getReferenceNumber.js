import ky from 'ky';

/**
 * Fetches a reference number and GUID from the API.
 * @returns {Promise<{ref: string, guid: string}>} Promise resolving to an object with ref and guid.
 * @throws {Error} If credentials are missing, HTTP request fails, or JSON parsing fails.
 */
export async function getReferenceNumber() {
  if (!process.env.AWS_API_KEY || !process.env.AWS_APP_ID) {
    throw new Error('Missing AWS credentials');
  }

  try {
    const url = `https://${process.env.AWS_APP_ID}.execute-api.us-east-1.amazonaws.com/prod/hello`;
    const response = await ky.get(url, {
      headers: { 'x-api-key': process.env.AWS_API_KEY },
      timeout: 30000,
    });
    if (!response.ok) {
      throw new Error('Failed to get Reference Number');
    }
    const data = await response.json();
    if (!data.ref || !data.guid) {
      return null;
    }
    return data;
  } catch (error) {
    throw new Error('Failed to get Reference Number', { cause: error });
  }
}
