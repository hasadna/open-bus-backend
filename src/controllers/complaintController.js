import axios from 'axios';
import { buildXmlFrom, getReferenceNumber } from '../utils/index.js';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

/**
 * Send complaint handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function sendComplaint(request, reply) {
  try {
    const { debug, userData, databusData } = request.body;

    request.log.info('Complaint submission started', {
      debug,
      userEmail: userData?.email,
      operator: databusData?.operator,
    });

    // Generate reference number
    const referenceNumber = getReferenceNumber(debug);

    // Build request payload
    const payload = {
      ...request.body,
      ReferenceNumber: referenceNumber,
    };

    // Generate XML
    const xml = buildXmlFrom(payload);

    if (debug) {
      request.log.info('Complaint submitted in debug mode', { referenceNumber });

      return reply.status(200).send({
        success: true,
        debug: true,
        xml,
        referenceNumber,
        timestamp: new Date().toISOString(),
      });
    }

    // Send to government API
    const response = await axios.post(URL, xml, {
      headers: { 'Content-Type': 'application/xml' },
      timeout: 30000, // 30 second timeout
    });

    request.log.info('Complaint submitted successfully', {
      referenceNumber,
      status: response.status,
    });

    return reply.status(200).send({
      success: true,
      debug: false,
      data: response.data,
      referenceNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    request.log.error('Complaint submission failed', {
      error: error.message,
      stack: error.stack,
      body: request.body,
    });

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: error.validation,
      });
    }

    // Handle axios errors
    if (error.response) {
      return reply.status(500).send({
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return reply.status(500).send({
        error: 'Request timeout',
        message: 'The government API request timed out',
      });
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the complaint',
    });
  }
}
