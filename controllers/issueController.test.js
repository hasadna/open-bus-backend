import { expect } from 'chai'

import { createIssue } from './issueController.js'

describe('createIssue', () => {
  let req, res, myAxios

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Issue',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        description: 'Test description',
        environment: 'Test environment',
        expectedBehavior: 'Should work',
        actualBehavior: 'Does not work',
        reproducibility: 'Always',
        attachments: [],
      },
    }
    res = {
      jsonCalledWith: null,
      statusCalledWith: null,
      json(data) {
        this.jsonCalledWith = data
        return this
      },
      status(code) {
        this.statusCalledWith = code
        return this
      },
    }
    myAxios = {
      post: async () => ({ data: { id: 123, title: 'Test Issue' } }),
    }
    process.env.GITHUB_TOKEN = 'fake-token'
    process.env.GITHUB_OWNER = 'fake-owner'
    process.env.GITHUB_REPO = 'fake-repo'
  })

  it('should create a GitHub issue and return the response data', async () => {
    await createIssue(req, res, myAxios)
    expect(res.jsonCalledWith).to.deep.equal({ id: 123, title: 'Test Issue' })
    expect(res.statusCalledWith).to.equal(200)
  })

  it('should handle errors and return 500', async () => {
    myAxios.post = async () => {
      throw new Error('GitHub error')
    }
    await createIssue(req, res, myAxios)
    expect(res.statusCalledWith).to.equal(500)
    expect(res.jsonCalledWith).to.deep.equal({ error: 'Internal Server Error' })
  })

  it('should send correct payload to GitHub API', async () => {
    let calledUrl = null
    let calledPayload = null
    let calledConfig = null
    myAxios.post = async (url, payload, config) => {
      calledUrl = url
      calledPayload = payload
      calledConfig = config
      return { data: { id: 1 } }
    }
    await createIssue(req, res, myAxios)
    expect(calledUrl).to.equal('https://api.github.com/repos/fake-owner/fake-repo/issues')
    expect(calledPayload.title).to.equal('Test Issue')
    expect(calledPayload.labels).to.deep.equal(['REPORTED-BY-USER'])
    expect(calledPayload.body).to.include('**Contact Name:** John Doe')
    expect(calledConfig.headers.Authorization).to.equal('Bearer fake-token')
    expect(calledConfig.headers['Content-Type']).to.equal('application/json')
  })

  it('should work with missing optional fields', async () => {
    req.body.attachments = undefined
    req.body.environment = undefined
    req.body.expectedBehavior = undefined
    req.body.actualBehavior = undefined
    req.body.reproducibility = undefined
    await createIssue(req, res, myAxios)
    expect(res.jsonCalledWith).to.have.property('id', 123)
  })

  it('should handle missing GitHub env variables gracefully', async () => {
    process.env.GITHUB_TOKEN = undefined
    process.env.GITHUB_OWNER = undefined
    process.env.GITHUB_REPO = undefined
    myAxios.post = async () => ({ data: { id: 999 } })
    await createIssue(req, res, myAxios)
    expect(res.jsonCalledWith).to.deep.equal({ id: 999 })
  })
})
