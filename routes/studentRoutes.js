// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
// Student Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if student with provided email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }
    // Create new student
    const newStudent = new Student({ name, email, password });
    await newStudent.save();
    res.status(201).json({ message: 'Student signed up successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Enroll to a Course
router.post('/courses/:courseId/enroll', async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const studentId = req.user._id; // Assuming student ID is available in the request (you'll need to implement authentication)
      
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      // Check if student is already enrolled in the course
      if (course.enrolledStudents.includes(studentId)) {
        return res.status(400).json({ message: 'Student already enrolled in the course' });
      }
      // Enroll the student in the course
      course.enrolledStudents.push(studentId);
      await course.save();
      res.status(200).json({ message: 'Student enrolled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // View All Course Details (excluding modules)
router.get('/courses', async (req, res) => {
    try {
      const courses = await Course.find().select('-modules');
      res.status(200).json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // View Enrolled Courses with Modules
router.get('/enrolled-courses', async (req, res) => {
    try {
      const studentId = req.user._id; // Assuming student ID is available in the request (you'll need to implement authentication)
      const courses = await Course.find({ enrolledStudents: studentId }).populate('modules', 'title');
      res.status(200).json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
// View Course Modules (if enrolled)
router.get('/courses/:courseId/modules', async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const studentId = req.user._id; // Assuming student ID is available in the request (you'll need to implement authentication)
      
      const course = await Course.findOne({ _id: courseId, enrolledStudents: studentId }).populate('modules');
      if (!course) {
        return res.status(404).json({ message: 'Course not found or student not enrolled in the course' });
      }
      res.status(200).json(course.modules);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Unenroll from a Course
router.delete('/courses/:courseId/unenroll', async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const studentId = req.user._id; // Assuming student ID is available in the request (you'll need to implement authentication)
      
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      // Check if student is enrolled in the course
      const studentIndex = course.enrolledStudents.indexOf(studentId);
      if (studentIndex === -1) {
        return res.status(400).json({ message: 'Student not enrolled in the course' });
      }
      // Remove student from enrolledStudents array
      course.enrolledStudents.splice(studentIndex, 1);
      await course.save();
      res.status(200).json({ message: 'Student unenrolled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
module.exports = router;
