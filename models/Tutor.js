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

});

module.exports = mongoose.model('Tutor', tutorSchema);
