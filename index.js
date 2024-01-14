const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createIssue } = require('./controllers/issueController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/create-issue', createIssue);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
