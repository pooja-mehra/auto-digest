const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const routes = require('./routes/api');
const ScannedGroceries = require('./models/scannedgroceries')


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
app.options('*', cors());
/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT")
  next();
});*/

app.use('/api', routes);

app.get('/', (req,res) => {
  ScannedGroceries.findOne({code:30800807004}).then((data)=>{
    res.json(data)
  })
});

const port = 8080;
app.listen(port, (req,res) => {
  console.log(`Server listening on port ${port}`);
});
