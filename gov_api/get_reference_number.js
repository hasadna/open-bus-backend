import axios from 'axios'
import * as cheerio from 'cheerio'

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

export async function getReferenceNumber() {
  const { data: html } = await axios.get(URL)
  const $ = cheerio.load(html)
  const el = $('#ReferenceNumber')
  if (!el.length) return null
  return el.val() ? el.val().trim() : el.text().trim()
}
