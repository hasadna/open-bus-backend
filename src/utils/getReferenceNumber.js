import axios from 'axios';
import { load } from 'cheerio';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function getReferenceNumber() {
  const { data: html } = await axios.get(URL);
  const dom = load(html);
  const el = dom('#ReferenceNumber');
  const guid = dom('#_form_guid');
  if (!el.length || !guid?.val()) {
    return null;
  }

  return { ref: el.text().trim(), guid: guid.val() };
}
