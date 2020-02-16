const mongoose = require('mongoose');


const callSchema = mongoose.Schema({
  name: String, // if twilio, name = phone call, else name = Conference
  audioId: String,
  audioUrl: String,
}, { timestamps: true });

const sentenceSchema = mongoose.Schema({
  call: { type: 'ObjectId', ref: 'Call' },

  timestamp: Date,
  phrase: String, // TODO: Rename to phrase
  confidence: Number,
  speakerTag: Number,
  aggressionProb: Number,
  isAggression: Boolean,
  words: [String]
});



module.exports = {
  Call: mongoose.model('Call', callSchema),
  Sentence: mongoose.model('Sentence', sentenceSchema),
};