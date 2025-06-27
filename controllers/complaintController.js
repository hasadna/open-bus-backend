import axios from 'axios'
import { buildXmlFrom } from '../gov_api/template_builder.js'
import { getReferenceNumber } from '../gov_api/get_reference_number.js'

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

export async function complaintController(req, res, myAxios = axios) {
  try {
    req.body.ReferenceNumber = getReferenceNumber()
    const xml = buildXmlFrom(req.body)
    if (req.body.debug) {
      console.log('XML to be sent:', xml)
      return res.status(200).json({ success: true, debug: true, xml })
    }
    const response = await myAxios.post(URL, xml, {
      headers: { 'Content-Type': 'application/xml' },
    })
    res.status(200).json({ success: true, data: response })
  } catch (error) {
    console.error('Error creating complain:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
