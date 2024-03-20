const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: String,
  description: String,
  tutor: String,
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  enrolledStudents: [{ type: String }] // Array of student user IDs
  // Add more fields as needed
});

module.exports = mongoose.model('Course', courseSchema);
