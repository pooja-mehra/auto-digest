const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const routes = require('./routes/api');
require('dotenv').config();
const app = express();
const db_url = process.env.MONGODB_URI
const client_url = process.env.REACT_APP_CLIENT_URL
const client_ws = process.env.REACT_APP_CLIENT_WS
const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({server})
var Redis = require('ioredis');
var redis = new Redis();
var pub = new Redis();

wss.on('connection', (ws) => {
  ws.on('message',function (message){
      ws.documentId = JSON.parse(message)
      redis.subscribe('delete-list', function (err, count) {
        if (err) console.error(err.message);
    });
  })
  redis.on('message', function (channel, message) {
    let listDetails = JSON.parse(message)
    if(ws.documentId && ws.documentId.lists.length > 0 && ws.documentId.lists.filter((d)=>d.listName === listDetails.listName && d.details.ownedBy === listDetails.ownerEmail).length > 0){
        const msg = Buffer.from(JSON.stringify({channel:channel,listName:listDetails.listName, ownedBy:listDetails.ownerEmail}));
        ws.send(msg); 
    }
})
});
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
const corsOptions = {
  origin: [client_url,client_ws]
};
app.use(cors({options:corsOptions}))
//app.options([client_ws], cors());
connect()
app.use('/api',cors({options:corsOptions}),routes);

app.get('/', async(req,res) => {
  res.json({status:status})
});

const port = 8080;
server.listen(port,(req,res) => {
  console.log(`Server listening on port ${port}`);
});

