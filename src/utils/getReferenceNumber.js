import { load } from 'cheerio';
import ky from 'ky';

const URL = 'https://govforms.gov.il/mw/forms/PublicTransportRequest@mot.gov.il';

function getFormParams(dom) {
  const script = dom('#govFormsScript').html();
  const match = script?.match(/var\s+formParams\s*=\s*(?<formParams>\{[\s\S]*\})\s*;?\s*$/u);

  if (!match) return null;

  try {
    return JSON.parse(match.groups.formParams);
  } catch {
    return null;
  }
}

export async function getReferenceNumber() {
  const response = await ky.get(URL);
  const html = await response.text();
  const dom = load(html);
  const process = getFormParams(dom)?.process;
  const requestID = process?.requestID;
  const referenceNumber = process?.referenceNumber;
  const formUniqueID = process?.formUniqueID;

  if (requestID && referenceNumber !== undefined && referenceNumber !== null) {
    return {
      formUniqueID,
      referenceNumber: String(referenceNumber),
      requestID,
    };
  }

  return null;
}
