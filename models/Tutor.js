// models/Tutor.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  // Add more fields as needed
});

module.exports = mongoose.model('Tutor', tutorSchema);
