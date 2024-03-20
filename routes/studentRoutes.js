// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
const Tutor = require('../models/Tutor');


// Route to post student user ID
router.post('/user-id', async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Check if userId already exists
      const existingStudent = await Student.findOne({ userId });
      if (existingStudent) {
        return res.status(200).json({ message: 'student already exists', tutor: existingStudent });
      }
  
      // Create new student with user ID
      const newStudent = new Student({ userId });
      await newStudent.save();
  
      res.status(201).json({ message: 'Student user ID posted successfully', student: newStudent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Update Student's Name
router.put('/:studentId/name', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { name } = req.body;
    
    // Find the tutor by ID
    const student = await Tutor.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    
    // Update the tutor's name
    student.name = name;
    await student.save();
    
    res.status(200).json({ message: 'About Me updated successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  
  // Display all tutors
  router.get('/tutors', async (req, res) => {
    try {
      const tutors = await Tutor.find();
      res.status(200).json(tutors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // View All Course Details (excluding modules) of a particular tutor
router.get('/courses/:tutorId', async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const courses = await Course.find({ tutor: tutorId }).select('-modules');
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Route to check if a student is enrolled in a course
router.get('/:studentId/isEnrolled/:courseId', async (req, res) => {
  try {
      const { studentId, courseId } = req.params;

      // Query to check if the student is enrolled in the course
      const isEnrolled = await Course.findOne({ _id: courseId, enrolledStudents: studentId });

      // Send response based on whether the student is enrolled or not
      res.json({ isEnrolled: !!isEnrolled });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
// Enroll to a Course
router.post('/courses/:courseId/enroll',  async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.body.userId;
    
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
router.get('/courses',  async (req, res) => {
  try {
    const courses = await Course.find().select('-modules');
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// View Enrolled Courses with Modules
router.get('/enrolled-courses',  async (req, res) => {
  try {
    const studentId = req.body.userId;
    const courses = await Course.find({ enrolledStudents: studentId }).populate('modules', 'title');
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// View Course Modules (if enrolled)
router.get('/courses/:courseId/modules',  async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.body.userId;
    
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
router.delete('/courses/:courseId/unenroll',  async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.body.userId;
    
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
