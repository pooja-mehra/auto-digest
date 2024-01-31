const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const routes = require('./routes/api');

require('dotenv').config();
const app = express();
const db_url = process.env.DB_URL

mongoose
    .connect(db_url, { useNewUrlParser: true })
    .then(() => console.log(`Database connected successfully`))
    .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use('/api', routes);

const port = 8080;
app.listen(port, (req,res) => {
  console.log(`Server listening on port ${port}`);
});

