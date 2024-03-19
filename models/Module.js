// models/Module.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
  title: String,
  link: String, // Single link field
  meetingDate: Date, // Field for meeting date
  uploadedDate: { type: Date, default: Date.now }, // Field for uploaded date, defaults to current date
  isLive: { type: Number, enum: [0, 1], default: 0 } // Field for live status, defaults to 0
  // Add more fields as needed
});

module.exports = mongoose.model('Module', moduleSchema);
