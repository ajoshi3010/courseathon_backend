// models/Student.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  modulesFinished:[{ type: Schema.Types.ObjectId, ref: 'Module' }],
  // Add more fields as needed
});

module.exports = mongoose.model('Student', studentSchema);