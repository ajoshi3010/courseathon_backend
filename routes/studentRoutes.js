// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import JWT library
const Student = require('../models/Student');
const Course = require('../models/Course');

// Middleware function to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
  jwt.verify(token, 'your-secret-key', (err, decoded) => { // Replace 'your-secret-key' with your actual secret key
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Set user information from decoded token
    next();
  });
};

// Enroll to a Course
router.post('/courses/:courseId/enroll', authenticateJWT, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.userId;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in the course' });
    }
    course.enrolledStudents.push(studentId);
    await course.save();
    res.status(200).json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// View All Course Details (excluding modules)
router.get('/courses', authenticateJWT, async (req, res) => {
  try {
    const courses = await Course.find().select('-modules');
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// View Enrolled Courses with Modules
router.get('/enrolled-courses', authenticateJWT, async (req, res) => {
  try {
    const studentId = req.user.userId;
    const courses = await Course.find({ enrolledStudents: studentId }).populate('modules', 'title');
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// View Course Modules (if enrolled)
router.get('/courses/:courseId/modules', authenticateJWT, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.userId;
    
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
router.delete('/courses/:courseId/unenroll', authenticateJWT, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.userId;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const studentIndex = course.enrolledStudents.indexOf(studentId);
    if (studentIndex === -1) {
      return res.status(400).json({ message: 'Student not enrolled in the course' });
    }
    course.enrolledStudents.splice(studentIndex, 1);
    await course.save();
    res.status(200).json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
