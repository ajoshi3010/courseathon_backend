// models/Module.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
  title: String,
  videoLink: String,
  meetingLink: String,
  meetingDate: Date, // Field for meeting date
  uploadedDate: { type: Date, default: Date.now }, // Field for uploaded date, defaults to current date
  // Add more fields as needed
});

module.exports = mongoose.model('Module', moduleSchema);
