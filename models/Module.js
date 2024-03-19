// models/Module.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
  title: String,
  videoLink: String,
  meetingLink: String,
  // Add more fields as needed
});

module.exports = mongoose.model('Module', moduleSchema);
