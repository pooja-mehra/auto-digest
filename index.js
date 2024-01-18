const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const routes = require('./routes/api');
const path = require('path');

require('dotenv').config();
const app = express();
mongoose
    .connect(process.env.DB, { useNewUrlParser: true })
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
app.use(express.static(path.join(__dirname, '../build')));
  app.get('/', (req, res) => {
    console.log(path.join(__dirname, '../build', 'index.html'))
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  })
const port = 8080;
app.listen(port, (req,res) => {
  console.log(`Server listening on port ${port}`);
});

