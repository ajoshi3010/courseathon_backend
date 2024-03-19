// routes/tutorRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');
const Course = require('../models/Course');
const Module = require('../models/Module');

// Middleware to authenticate and authorize tutor
const authenticateAndAuthorizeTutor = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Get token from authorization header
    const decoded = jwt.verify(token, 'your-secret-key'); // Verify the token
    const tutor = await Tutor.findById(decoded.userId); // Check if tutor exists
    if (!tutor) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = tutor; // Set tutor in request object for further use
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Add Course Route
router.post('/:tutorId/courses', authenticateAndAuthorizeTutor, async (req, res) => {
  try {
    const { title, description } = req.body;
    const tutorId = req.params.tutorId;
  
    // Check if tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    if (tutorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' }); // Not authorized to create course for other tutors
    }
  
    // Create new course
    const newCourse = new Course({ title, description, tutor: tutorId });
    await newCourse.save();
  
    res.status(201).json({ message: 'Course added successfully', course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add Module to Course Route
router.post('/:tutorId/courses/:courseId/modules', authenticateAndAuthorizeTutor, async (req, res) => {
  try {
    const { title, videoLink, meetingLink, meetingDate } = req.body;
    const { tutorId, courseId } = req.params;
  
    // Check if tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
  
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.tutor.toString() !== tutorId) {
      return res.status(403).json({ message: 'Forbidden' }); // Not authorized to add module to course of other tutors
    }
  
    // Create new module
    const newModule = new Module({ title, videoLink, meetingLink, meetingDate });
    await newModule.save();
  
    // Add module to course
    course.modules.push(newModule._id);
    await course.save();
  
    res.status(201).json({ message: 'Module added to course successfully', module: newModule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Other routes need similar authorization checks

module.exports = router;
