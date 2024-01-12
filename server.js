const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const routes = require('./routes/api');

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
app.get("/", async (req,res) =>{
  const properNameList = ['PEANUT', 'PEANUTs','Almond'];
  const commonNameList = ['Pattie', 'BUTTER','slice'];
  let properName =[]
  let commonName=[]
  let itemName = 'AV PNT Bttr';
  let subStringArray = itemName.split(" ")
  subStringArray.forEach((name,i)=>{
    let nameCharArray = name.replace(/\s/g, "").split("");
    let regexNameChars = (''+[...nameCharArray].map((n,i)=>'(?=.*['+n+n.toUpperCase()+'])') + '')
        .replaceAll(',','')
    properNameList.filter((item,i)=> {if(item.match(regexNameChars)){
      properName.push(item)
    }})
    commonNameList.filter((item,i)=> {if(item.match(regexNameChars)){
      commonName.push(item)
    }})
  })
  res.json({proper:properName,common:commonName})
})

const port = 8080;
app.listen(port, (req,res) => {
  console.log(`Server listening on port ${port}`);
});

