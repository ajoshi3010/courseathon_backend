// models/Tutor.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
  name: String,
  email: String,
  // Add more fields as needed
});

module.exports = mongoose.model('Tutor', tutorSchema);
