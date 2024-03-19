// routes/tutorRoutes.js

const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');
const Course = require('../models/Course');
const Module = require('../models/Module');


// Route to post tutor user ID
router.post('/user-id', async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Check if userId already exists
      const existingTutor = await Tutor.findOne({ userId });
      if (existingTutor) {
        return res.status(200).json({ message: 'tutor already exists', tutor: existingTutor });
      }
  
      // Create new tutor with user ID
      const newTutor = new Tutor({ userId });
      await newTutor.save();
  
      res.status(201).json({ message: 'Tutor user ID posted successfully', tutor: newTutor });
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
      const tutor = await Tutor.findOne({ userId: tutorId });
      if (!tutor) {
        return res.status(404).json({ message: 'Tutor not found' });
      }
  
      // Create new course
      const newCourse = new Course({ title, description, tutor: tutor._id }); // Use tutor._id instead of tutor
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
    //   const { title, link, meetingDate,uploadedDate,isLive } = req.body;
      const { tutorId, courseId } = req.params;
  
      // Check if tutor exists
      const tutor = await Tutor.findOne({ userId: tutorId });
      if (!tutor) {
        return res.status(404).json({ message: 'Tutor not found' });
      }
  
      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Create new module
      const newModule = new Module(req.body);
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

  // View Courses Added by the Tutor
  router.get('/courses', async (req, res) => {
    try {
      const { tutorId } = req.body; // Assuming tutor ID is sent in the request body
      const courses = await Course.find({ tutor: tutorId });
      res.status(200).json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// Update Course Content
router.put('/courses/:courseId', async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const { title, description } = req.body;
      
      const course = await Course.findByIdAndUpdate(courseId, { title, description }, { new: true });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Delete Module
router.delete('/courses/:courseId/modules/:moduleId', async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const moduleId = req.params.moduleId;
      
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const moduleIndex = course.modules.indexOf(moduleId);
      if (moduleIndex === -1) {
        return res.status(404).json({ message: 'Module not found in course' });
      }
      course.modules.splice(moduleIndex, 1);
      await course.save();
      await Module.findByIdAndDelete(moduleId);
      res.status(200).json({ message: 'Module deleted successfully' });
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
  // Delete Course and Related Modules
router.delete('/courses/:courseId', async (req, res) => {
    try {
        const courseId = req.params.courseId;

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        // Delete related modules
        await Module.deleteMany({ courseId });

        res.status(200).json({ message: 'Course and related modules deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// View Course Contents Route
router.get('/courses/:courseId/contents', async (req, res) => {
    try {
        const courseId = req.params.courseId;

        // Find the course by courseId
        const course = await Course.findById(courseId).populate('modules');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update Module Route
router.put('/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { title, videoLink, meetingLink, meetingDate, isLive } = req.body;

        // Find the module by moduleId
        let module = await Module.findById(moduleId);

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Update module fields
        module.title = title;
        module.videoLink = videoLink;
        module.meetingLink = meetingLink;
        module.meetingDate = meetingDate;
        module.isLive = isLive;

        // Save the updated module
        module = await module.save();

        res.status(200).json({ message: 'Module updated successfully', module });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  module.exports = router;
