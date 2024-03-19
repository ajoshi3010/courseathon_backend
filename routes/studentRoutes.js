// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

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

module.exports = router;
