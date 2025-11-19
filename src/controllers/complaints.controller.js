import axios from 'axios';

import { getReferenceNumber, templateBuilder } from '../utils/index.js';

const URL = 'https://forms.gov.il/globaldata/getsequence/setform.aspx?displang=he&formtype=PniotMot%40mot.gov.il';
const ERROR = '"קיימת בעיה בנתוני הטופס, אנא פנו לתמיכה לקבלת סיוע בפתרון הבעיה בטלפון 1299"';
/**
 * Send complaint handler
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function sendComplaint(request, reply) {
  try {
    const { debug, data } = request.body;
    const isDebug = Boolean(debug) || process.env.NODE_ENV === 'test' || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    request.log.info('Complaint submission started', { debug: isDebug, email: data?.email, operator: data?.busOperator?.dataText });

    const { ref, guid } = isDebug ? { ref: '1234567', guid: 'test' } : await getReferenceNumber();

    const xml = templateBuilder({ ...request.body, ReferenceNumber: ref });

    if (isDebug) {
      request.log.info('Complaint submitted in debug mode');
      return reply.status(200).send({ success: true, debug: true, xml, ref });
      // for test xml resepnse
      //return reply.status(200).headers({ 'content-type': 'application/xml' }).send(xml);
    }
    const form = new FormData();
    form.append('_form_GeneralAttributes', '<root><formId>PniotMot@mot.gov.il</formId><formVersion>3.0.5</formVersion></root>');
    form.append('_form_data', xml);
    form.append('_form_guid', guid);

    const response = await axios.post(URL, form, {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryXRTYDlcg99RDCq0Z',
        Host: 'forms.gov.il',
        Origin: 'https://forms.gov.il',
        Referer: 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      },
      timeout: 30000,
    });
    debugger;
    if (response.data === ERROR) throw Error(ERROR);
    request.log.info('Complaint submitted successfully', { referenceNumber: ref, status: response.status });
    return reply.status(200).send({ success: true, debug: false, data: response.data, referenceNumber: ref });
  } catch (error) {
    request.log.error('Complaint submission failed', { error: error.message, stack: error.stack, body: request.body });
    // // Handle validation errors
    // if (error.validation) {
    //   return reply.status(400).send({ error: 'Validation failed', details: error.validation });
    // }

    // // Handle axios errors
    // if (error.response) {
    //   return reply.status(500).send({ error: 'Government API error', message: `Status: ${error.response.status} - ${error.response.statusText}` });
    // }

    // // Handle timeout errors
    // if (error.code === 'ECONNABORTED') {
    //   return reply.status(500).send({ error: 'Request timeout', message: 'The government API request timed out' });
    // }

    return reply
      .status(500)
      .send({ error: 'Internal server error', message: 'An unexpected error occurred while processing the complaint', details: error });
  }
}
