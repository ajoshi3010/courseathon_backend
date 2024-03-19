// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

// Single Signin Route
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the email exists in tutors
    const tutor = await Tutor.findOne({ email });
    if (tutor) {
      // Here you can verify the password (if needed)
      // For simplicity, we'll just send back a success response
      return res.status(200).json({ message: 'Tutor signin successful' });
    }
    // Check if the email exists in students
    const student = await Student.findOne({ email });
    if (student) {
      // Here you can verify the password (if needed)
      // For simplicity, we'll just send back a success response
      return res.status(200).json({ message: 'Student signin successful' });
    }
    // If email doesn't exist in tutors or students
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
