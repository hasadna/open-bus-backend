import axios from 'axios';
import crypto from 'crypto';

import { getReferenceNumber, templateBuilder } from '../utils/index.js';

const DEBUG_ENV = process.env.NODE_ENV === 'test' || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const URL = 'https://forms.gov.il/globaldata/getsequence/setform.aspx?displang=he&formtype=PniotMot%40mot.gov.il';
const ERROR = 'קיימת בעיה בנתוני הטופס, אנא פנו לתמיכה לקבלת סיוע בפתרון הבעיה בטלפון 1299';
const TIMEOUT = 30000;

/**
 * Send complaint handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function sendComplaint(request, reply) {
  try {
    const isDebug = Boolean(request.body.debug) || DEBUG_ENV;

    request.log.info('Complaint submission started');

    const clientData = isDebug ? { ref: '1234567', guid: 'test', client: axios } : await getReferenceNumber();

    if (clientData === null) return reply.status(500).send({ success: false, error: 'Failed to get reference number' });

    const xml = templateBuilder(request.body, clientData.ref);

    const boundary = `----WebKitFormBoundary${crypto.randomBytes(16).toString('hex')}`;

    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="_form_GeneralAttributes"',
      '',
      '<root><formId>PniotMot@mot.gov.il</formId><formVersion>3.0.5</formVersion></root>',
      `--${boundary}`,
      'Content-Disposition: form-data; name="_form_data"',
      '',
      xml,
      `--${boundary}`,
      'Content-Disposition: form-data; name="_form_guid"',
      '',
      clientData.guid,
      `--${boundary}--`,
      '',
    ].join('\r\n');

    if (isDebug) {
      request.log.info('Complaint submitted in debug mode');
      //return reply.status(200).send({ success: true, debug: true, xml, ref: clientData.ref });
      // for test xml resepnse
      return reply.status(200).headers({ 'content-type': 'application/xml' }).send(xml);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(URL, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body, 'utf8'),
        Origin: 'https://forms.gov.il',
        Referer: 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.data === ERROR) {
      return reply.status(500).send({ error: 'Government API error', message: response.data });
    }

    request.log.info('Complaint submitted successfully', { referenceNumber: clientData.ref, status: response.status });

    return reply.status(200).send({ success: true, debug: false, data: response.data, referenceNumber: clientData.ref });
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

    return reply
      .status(500)
      .send({ error: 'Internal server error', message: 'An unexpected error occurred while processing the complaint', details: error });
  }
}
