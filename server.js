const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Set up the server
const app = express();
app.use(bodyParser.json());
app.use(cors())

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

// Start the server
const port = 8080;
app.listen(port, (req,res) => {
  console.log(`Server listening on port ${port}`);
});

