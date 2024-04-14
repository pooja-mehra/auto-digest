const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const routes = require('./routes/api');
require('dotenv').config();
const app = express();
const db_url = process.env.MONGODB_URI
const client_url = process.env.REACT_APP_CLIENT_URL
var status = 'fail'

async function connect() {
  try {
    await mongoose.connect(db_url);
    status = 'connected'
  } catch (error) {
    status = 'error'
  }
}
app.use(bodyParser.json());
app.use(cors())
app.options(client_url, cors());
connect()

app.use('/api',routes);

app.get('/', async(req,res) => {
  res.json({status:status})
});

const port = 8080;
app.listen(port,(req,res) => {
  console.log(`Server listening on port ${port}`);
});

