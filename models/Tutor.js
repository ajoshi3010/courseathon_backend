// models/Tutor.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: String, // Or any other credential field you may need
  // Add more fields as needed
});

module.exports = mongoose.model('Tutor', tutorSchema);
