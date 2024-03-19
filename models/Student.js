// models/Student.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },

});

module.exports = mongoose.model('Student', studentSchema);
