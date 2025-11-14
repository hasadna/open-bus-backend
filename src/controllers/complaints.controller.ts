import axios from 'axios';

import { getReferenceNumber, templateBuilder } from '../utils/index.js';

const URL = 'https://forms.gov.il/globaldata/getsequence/setform.aspx?formtype=PniotMot%40mot.gov.il';

/**
 * Send complaint handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function sendComplaint(request, reply) {
  try {
    const { debug, userData, databusData } = request.body;
    const isDebug = Boolean(debug) || process.env.NODE_ENV === 'test' || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    request.log.info('Complaint submission started', { debug: isDebug, userEmail: userData?.email, operator: databusData?.operator });

    const referenceNumber = isDebug ? '1234567' : await getReferenceNumber();
    const xml = templateBuilder({ ...request.body, ReferenceNumber: referenceNumber });

    if (isDebug) {
      request.log.info('Complaint submitted in debug mode');
      return reply.status(200).send({ success: true, debug: true, xml });
    }

    const response = await axios.post(URL, xml, { headers: { 'Content-Type': 'application/xml' }, timeout: 30000 });

    request.log.info('Complaint submitted successfully', { referenceNumber, status: response.status });
    return reply.status(200).send({ success: true, debug: false, data: response.data, referenceNumber });
  } catch (error) {
    request.log.error('Complaint submission failed', { error: error.message, stack: error.stack, body: request.body });

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({ error: 'Validation failed', details: error.validation });
    }

    // Handle axios errors
    if (error.response) {
      return reply.status(500).send({ error: 'Government API error', message: `Status: ${error.response.status} - ${error.response.statusText}` });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return reply.status(500).send({ error: 'Request timeout', message: 'The government API request timed out' });
    }

    return reply.status(500).send({ error: 'Internal server error', message: 'An unexpected error occurred while processing the complaint' });
  }
}
