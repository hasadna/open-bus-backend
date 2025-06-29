import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function getReferenceNumber(debug = false) {
  if (debug) {
    return '1234567';
  }

  const { data: html } = await axios.get(URL);
  const dom = cheerioLoad(html);
  const el = dom('#ReferenceNumber');

  if (!el.length) {
    return null;
  }

  return el.val() ? el.val().trim() : el.text().trim();
}
