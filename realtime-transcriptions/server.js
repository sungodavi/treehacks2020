"use strict";
require('dotenv').load();

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const HttpDispatcher = require('httpdispatcher');
const WebSocketServer = require('websocket').server;
const TranscriptionService = require('./transcription-service');
const request = require('request');



const dispatcher = new HttpDispatcher();
const wsserver = http.createServer(handleRequest);

const HTTP_SERVER_PORT = process.env.PORT || 8080;

function log(message, ...args) {
  console.log(new Date(), message, ...args);
}

const mediaws = new WebSocketServer({
  httpServer: wsserver,
  autoAcceptConnections: true,
});


function handleRequest(request, response){
  try {
    dispatcher.dispatch(request, response);
  } catch(err) {
    console.error(err);
  }
}

dispatcher.onPost('/twiml', function(req,res) {
  log('POST TwiML');

  var filePath = path.join(__dirname+'/templates', 'streams.xml');
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'text/xml',
    'Content-Length': stat.size
  });

  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

mediaws.on('connect', function(connection) {
  log('Media WS: Connection accepted');
  new MediaStreamHandler(connection);
});

class MediaStreamHandler {
  constructor(connection) {
    this.metaData = null;
    this.trackHandlers = {};
    connection.on('message', this.processMessage.bind(this));
    connection.on('close', this.close.bind(this));
  }

  processMessage(message){

    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      if (data.event === "start") {
        this.metaData = data.start;
      }
      if (data.event !== "media") {
        return;
      }
      const track = data.media.track;
      if (this.trackHandlers[track] === undefined) {
        const service = new TranscriptionService();
        service.on('transcription', (transcription) => {
        let date = new Date();
        let shasum = crypto.createHash('sha256');
         shasum.update(service.streamCreatedAt.toString())
         let sendData = {
            id: this.metaData.callSid,  
            date: date.toString(),
            confidence: transcription.confidence,
            transcript: transcription.transcript,
            speakerTag: transcription.words[0].speakerTag,
            words: transcription.words,
            type: "twilio"
          }

          var options = {
            uri: 'http://35.192.184.26/classify/',
            method: 'POST',
            json: sendData
          };

          request(options, function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
          });

          // log(`Transcription (${track}): ${transcription}`);
          console.log(sendData);
        });
        this.trackHandlers[track] = service;
      }
      this.trackHandlers[track].send(data.media.payload);
    } else if (message.type === 'binary') {
      log('Media WS: binary message received (not supported)');
    }
  }

  close(){
    log('Media WS: closed');

    for (let track of Object.keys(this.trackHandlers)) {
      log(`Closing ${track} handler`);
      this.trackHandlers[track].close();
    }
  }
}

wsserver.listen(HTTP_SERVER_PORT, function(){
  console.log("Server listening on: http://localhost:%s", HTTP_SERVER_PORT);
});
