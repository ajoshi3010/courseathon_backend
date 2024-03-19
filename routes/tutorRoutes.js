// routes/tutorRoutes.js

const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');

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

module.exports = router;
