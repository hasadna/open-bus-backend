import express from 'express'
import cors from 'cors'
import { createIssue } from './controllers/issueController.js'
import { complaintController } from './controllers/complaintController.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/', (_, res) => {
  res.send('alive')
})

app.post('/create-issue', createIssue)
app.post('/complaint', complaintController)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
