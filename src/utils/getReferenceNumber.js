import { load } from 'cheerio';
import ky from 'ky';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function getReferenceNumber() {
  const response = await ky.get(URL);
  const html = await response.text();
  const dom = load(html);
  const ref = dom('#ReferenceNumber').text().trim();
  const guid = dom('#_form_guid').val();

  if (!ref || !guid) return null;

  return { ref, guid };
}
