import axios from 'axios'

import { buildXmlFrom } from '../utils/template_builder.js'
import { getReferenceNumber } from '../utils/get_reference_number.js'

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function sendComplaint(request, reply) {
  try {
    request.body.ReferenceNumber = getReferenceNumber(request.body.debug)
    const xml = buildXmlFrom(request.body)
    if (request.body.debug) {
      return reply.status(200).send({ success: true, debug: true, xml })
    }
    const response = await axios.post(URL, xml, {
      headers: { 'Content-Type': 'application/xml' },
    })
    return reply.status(200).send({ success: true, data: response })
  } catch (error) {
    console.error('Error creating complain:', error)
    return reply.status(500).send({ error: 'Internal Server Error' })
  }
}
