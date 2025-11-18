import { load } from 'cheerio';
import ky from 'ky';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function getReferenceNumber() {
  const { data: html } = await ky.get(URL);
  const dom = load(html);
  const el = dom('#ReferenceNumber');

  if (!el.length) {
    return null;
  }

  return el.text().trim();
}
