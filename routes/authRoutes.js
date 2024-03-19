// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT library
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

// Tutor Signup Route
router.post('/tutor/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create tutor
    const newTutor = new Tutor({
      name,
      email,
      password: hashedPassword
    });
    await newTutor.save();
    // Generate JWT token
    const token = jwt.sign({ userId: newTutor._id, userType: 'tutor' }, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key
    res.status(201).json({ message: 'Tutor signed up successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Student Signup Route
router.post('/student/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create student
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword
    });
    await newStudent.save();
    // Generate JWT token
    const token = jwt.sign({ userId: newStudent._id, userType: 'student' }, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key
    res.status(201).json({ message: 'Student signed up successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Signin Route
router.post('/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if the email exists in tutors
      const tutor = await Tutor.findOne({ email });
      if (tutor) {
        // Compare passwords
        const isMatch = await bcrypt.compare(password, tutor.password);
        if (isMatch) {
          // Generate JWT token
          const token = jwt.sign({ userId: tutor._id, userType: 'tutor' }, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key
          return res.status(200).json({ message: 'Tutor signin successful', token });
        } else {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      }
      // Check if the email exists in students
      const student = await Student.findOne({ email });
      if (student) {
        // Compare passwords
        const isMatch = await bcrypt.compare(password, student.password);
        if (isMatch) {
          // Generate JWT token
          const token = jwt.sign({ userId: student._id, userType: 'student' }, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key
          return res.status(200).json({ message: 'Student signin successful', token });
        } else {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      }
      // If email doesn't exist in tutors or students
      return res.status(404).json({ message: 'User not found' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
