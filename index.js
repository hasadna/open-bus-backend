const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createIssue } = require('./controllers/issueController');
const { complaintController } = require('./controllers/complaintController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (_, res) => {res.send('alive')});

app.post('/create-issue', createIssue);
app.post('/complaint', complaintController);

app.use('/traces', express.static('traces'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
