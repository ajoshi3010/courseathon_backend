// models/Student.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  _id:String,
  name: String,
  // Add more fields as needed
});

module.exports = mongoose.model('Student', studentSchema);
