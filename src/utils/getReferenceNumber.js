import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function getReferenceNumber() {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const { data: html } = await client.get(URL);
  const dom = load(html);
  const ref = dom('#ReferenceNumber').text().trim();
  const guid = dom('#_form_guid').val();

  if (!ref || !guid) return null;

  return { ref, guid, client };
}
