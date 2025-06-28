import axios from 'axios'

import { buildXmlFrom } from '../utils/template_builder.js'
import { getReferenceNumber } from '../utils/get_reference_number.js'

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function sendComplaint(req, res) {
  try {
    req.body.ReferenceNumber = getReferenceNumber(req.body.debug)
    const xml = buildXmlFrom(req.body)
    if (req.body.debug) {
      return res.status(200).json({ success: true, debug: true, xml })
    }
    const response = await axios.post(URL, xml, {
      headers: { 'Content-Type': 'application/xml' },
    })
    res.status(200).json({ success: true, data: response })
  } catch (error) {
    console.error('Error creating complain:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
