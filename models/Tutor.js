// models/Tutor.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
  _id: { type: String, unique: true }, // Ensure _id is unique
  name: String,
  aboutMe: String,
  imageLink: String
  // Add more fields as needed
});

module.exports = mongoose.model('Tutor', tutorSchema);
