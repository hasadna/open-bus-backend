import axios from 'axios'

import { buildXmlFrom } from '../utils/template_builder.js'
import { getReferenceNumber } from '../utils/get_reference_number.js'

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

export const sendComplaintSchema = {
  tags: ['Complaints'],
  summary: 'Send a complaint',
  description: 'Submits a complaint to the government forms system',
  body: {
    type: 'object',
    properties: {
      debug: {
        type: 'boolean',
        description: 'Enable debug mode to return XML without sending',
        default: false,
      },
      userData: {
        type: 'object',
        required: ['firstName', 'lastName', 'id', 'email', 'phone'],
        properties: {
          firstName: { type: 'string', description: 'First name of the complainant' },
          lastName: { type: 'string', description: 'Last name of the complainant' },
          id: { type: 'string', description: 'ID number of the complainant' },
          email: { type: 'string', format: 'email', description: 'Email address of the complainant' },
          phone: { type: 'string', description: 'Phone number of the complainant' },
          complaintType: { type: 'string', description: 'Type of complaint (e.g., no_stop)' },
          description: { type: 'string', description: 'Detailed description of the complaint' },
        },
      },
      databusData: {
        type: 'object',
        required: ['operator'],
        properties: {
          operator: { type: 'number', description: 'Bus operator ID' },
          loc: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
            description: 'Location coordinates [longitude, latitude]',
          },
          color: { type: 'number', description: 'Bus color code' },
          bearing: { type: 'number', description: 'Direction bearing in degrees' },
          recorded_at_time: { type: 'number', description: 'Timestamp when the incident was recorded' },
          point: {
            type: 'object',
            description: 'Detailed point information from the bus tracking system',
            properties: {
              id: { type: 'number' },
              siri_snapshot_id: { type: 'number' },
              siri_ride_stop_id: { type: 'number' },
              recorded_at_time: { type: 'string', format: 'date-time' },
              lon: { type: 'number' },
              lat: { type: 'number' },
              bearing: { type: 'number' },
              velocity: { type: 'number' },
              distance_from_journey_start: { type: 'number' },
              distance_from_siri_ride_stop_meters: { type: 'number' },
            },
          },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        debug: { type: 'boolean' },
        xml: { type: 'string', description: 'Generated XML (only in debug mode)' },
        data: { type: 'object', description: 'Response data from the government forms system' },
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
