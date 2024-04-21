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
//var redis = new Redis();
const redis = new Redis(process.env.REDDIS_URL);
redis.subscribe('delete-list', function (err, count) {
  if (err) console.error(err.message);
});
redis.subscribe('edit-list', function (err, count) {
  if (err) console.error(err.message);
});
redis.subscribe('share-list', function (err, count) {
  if (err) console.error(err.message);
});

wss.on('connection', (ws) => {
  ws.on('message',function (message){
      ws.documentId = JSON.parse(message)
  })
  redis.on('message', function (channel, message) {
    let listDetails = JSON.parse(message)
    if(channel ==='delete-list'){
    if(ws.documentId && ws.documentId.lists && ws.documentId.lists.length > 0 && ws.documentId.lists.filter((d)=>d.listName === listDetails.listName && d.details.ownedBy === listDetails.ownerEmail).length > 0){
        const msg = Buffer.from(JSON.stringify({channel:channel,listName:listDetails.listName, ownedBy:listDetails.ownerEmail}));
        ws.send(msg); 
    }}
    if(channel ==='edit-list'){
      if(ws.documentId && ws.documentId.listName === listDetails.listName && listDetails.colaborators.includes(ws.documentId.userEmail)){
        const msg = Buffer.from(JSON.stringify({channel:channel,listName:listDetails.listName, ownedBy:listDetails.ownerEmail, items:listDetails.items,editor:listDetails.editor}));
        ws.send(msg); 
    }}
    if(channel ==='share-list'){
      if(ws.documentId && ws.documentId.lists.filter((d)=>d.listName === listDetails.listName && d.details.ownedBy === listDetails.ownerEmail).length === 0 && listDetails.colaborators.includes(ws.documentId.userEmail)){
          const msg = Buffer.from(JSON.stringify({channel:channel,listName:listDetails.listName, ownedBy:listDetails.ownerEmail, permission:listDetails.permission}));
          ws.send(msg); 
      }}
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

const port = process.env.PORT;
server.listen(port,(req,res) => {
  console.log(`Server listening on port ${port}`);
});

