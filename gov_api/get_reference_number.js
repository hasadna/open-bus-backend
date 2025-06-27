import { load as cheerioLoad } from 'cheerio'
import axios from 'axios'

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

export async function getReferenceNumber(debug = false) {
  if (debug) return '1854849'
  const { data: html } = await axios.get(URL)
  const $ = cheerioLoad(html)
  const el = $('#ReferenceNumber')
  if (!el.length) return null
  return el.val() ? el.val().trim() : el.text().trim()
}
