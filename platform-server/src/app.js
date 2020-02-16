const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Call, Sentence } = require('./models');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

const callNames = {
  twilio: 'Remote Standup',
  box: 'Conference Meeting'
};

app.use((req, res, next) => {
  console.log(req.url);
  console.log(req.body);
  return next();
});

app.get('/', async (req, res) => {
  const calls = await Call.find();
  const sentences = await Promise.all(calls.map(c => Sentence.find({ call: c._id })));

  const result = calls.map((c, index) => Object.assign(c.toObject(), { sentences: sentences[index] }));
  return res.status(200).send(result);
});

app.post('/calls', async (req, res) => {
  const call = new Call(req.body);
  await call.save();
  return res.status(201).send(call);
});

app.post('/calls/transcript', async (req, res) => {
  const {
    id,
    date,
    confidence,
    speakerTag,
    type,
    transcript,
    prob_aggression,
    is_aggression
  } = req.body;

  let call = await Call.findOne({ audioId: id });
  if(!call) {
    if(!callNames[type]) {
      return res.sendStatus(500);
    }

    call = new Call({
      name: callNames[type],
      audioId: id
    });
    await call.save();
  }
  const sentence = new Sentence({
    call: call._id,
    timestamp: new Date(date),
    phrase: transcript,
    confidence,
    speakerTag,
    aggressionProb: prob_aggression,
    isAggression: is_aggression,
  });
  await sentence.save();

  return res.status(201).send({
    call,
    sentence
  });
});

app.post('/calls/audio', async (req, res) => {
  const audioId = req.body.CallSid;
  const audioUrl = req.body.RecordingUrl;
  const call = await Call.findOne({ audioId });
  if(!call) {
    return res.status(500).send(`No call found for id ${audioId}`);
  }
  call.audioUrl = audioUrl;
  await call.save();
  return res.sendStatus(200);
});

module.exports = app;
