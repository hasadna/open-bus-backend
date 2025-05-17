import axios from 'axios';

import { buildXmlFrom } from '../gov_api/template_builder.js';

const URL = 'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il';

export async function complaintController(req, res) {
	try {
		const xml = buildXmlFrom(req.body);
		const response = await axios.post(URL, xml, {
			headers: { 'Content-Type': 'application/xml' },
		});
		res.status(200).json({ success: true, data: response });
	} catch (error) {
		console.error('Error creating complain:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}
