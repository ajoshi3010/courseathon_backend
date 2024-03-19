// models/Course.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: String,
  description: String,
  tutor: { type: Schema.Types.ObjectId, ref: 'Tutor' },
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }], // New field for enrolled students
  // Add more fields as needed
});

module.exports = mongoose.model('Course', courseSchema);
