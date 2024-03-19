// routes/tutorRoutes.js

const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');
const Course = require('../models/Course');
const Module = require('../models/Module');
// Tutor Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if tutor with provided email already exists
    const existingTutor = await Tutor.findOne({ email });
    if (existingTutor) {
      return res.status(400).json({ message: 'Tutor with this email already exists' });
    }
    // Create new tutor
    const newTutor = new Tutor({ name, email, password });
    await newTutor.save();
    res.status(201).json({ message: 'Tutor signed up successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Add Course Route
router.post('/:tutorId/courses', async (req, res) => {
    try {
      const { title, description } = req.body;
      const tutorId = req.params.tutorId;
  
      // Check if tutor exists
      const tutor = await Tutor.findById(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: 'Tutor not found' });
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
  router.post('/:tutorId/courses/:courseId/modules', async (req, res) => {
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
  
  // Get Students Enrolled in Course Route
  router.get('/:tutorId/courses/:courseId/students', async (req, res) => {
    try {
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
  
      // Populate enrolled students
      await course.populate('enrolledStudents').execPopulate();
  
      res.status(200).json({ students: course.enrolledStudents });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  module.exports = router;
