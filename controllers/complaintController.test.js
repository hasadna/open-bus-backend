import { it } from 'mocha'
import { complaintController } from './complaintController.js'

it('should test the complaint controller', async () => {
  // Mock the request and response objects
  const req = {
    body: {
      // Add necessary fields for the test
      name: 'Test User',
      complaint: 'This is a test complaint',
    },
  }

  const res = {
    status: function (statusCode) {
      this.statusCode = statusCode
      return this
    },
    json: function (data) {
      this.data = data
    },
  }

  // Mock axios
  const myAxios = {
    history: [],
    post: async (url, xml, options) => {
      history.push({
        url,
        method: 'post',
        data: xml,
        headers: options.headers,
      })
      return { data: { success: true } } // Mock response
    },
  }

  // Call the controller function
  await complaintController(req, res, myAxios)

  // Assertions
  if (res.statusCode !== 200 || !res.data.success) {
    throw new Error('Test failed')
  }

  if (myAxios.history.length === 0) {
    throw new Error('No request was made to axios')
  }
  if (
    myAxios.history[0].url !==
    'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'
  ) {
    throw new Error('Request URL does not match')
  }
  if (myAxios.history[0].method !== 'post') {
    throw new Error('Request method is not POST')
  }
})
