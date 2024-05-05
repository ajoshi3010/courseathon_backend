// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
const Tutor = require('../models/Tutor');
const Module = require('../models/Module');


// Route to post student user ID
router.post('/user-id', async (req, res) => {
    try {
      const { userId,name } = req.body;
  
      // Check if userId already exists
      const existingStudent = await Student.findOne({ userId });
      if (existingStudent) {
        return res.status(200).json({ message: 'student already exists', tutor: existingStudent });
      }
  
      // Create new student with user ID
      const newStudent = new Student({ userId,name });
      await newStudent.save();
  
      res.status(201).json({ message: 'Student user ID posted successfully', student: newStudent });
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
  router.get('/courses/:tutorId/:userId', async (req, res) => {
    try {
      const tutorId = req.params.tutorId;
      const userId = req.params.userId;
      
      console.log(userId)
      // Fetch courses for the specified tutor
      const courses = await Course.find({ tutor: tutorId });
      // Check if the current user is enrolled in each course
      const coursesWithEnrollmentStatus = courses.map(course => {
        console.log(course)
        console.log(userId)
        const isEnrolled = course.enrolledStudents.includes(userId);
        return { ...course.toObject(), isEnrolled };
      });
  
      res.status(200).json(coursesWithEnrollmentStatus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
// Enroll to a Course
router.post('/enroll', async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({ message: 'Student already enrolled in the course' });
    }

    course.enrolledStudents.push(userId);
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

// View Enrolled Courses with Modules, Tutor Name, and Student Progress
router.get('/enrolled-courses/:userId', async (req, res) => {
  try {
    const studentId = req.params.userId;
    
    // Retrieve enrolled courses with modules and tutor names
    const courses = await Course.find({ enrolledStudents: studentId })
                                .populate('modules', 'title')
                                .populate({
                                  path: 'tutor',
                                  select: 'name',
                                  model: 'Tutor',
                                  ref: 'Tutor',
                                  localField: 'tutor', // Field in Course schema
                                  foreignField: 'userId' // Field in Tutor schema
                                });

    // Calculate progress for each enrolled course
    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
      // Count the number of completed modules for the student in the course
      const completedModules = (await Student.findOne({ userId: studentId })).modulesFinished
                                  .filter(moduleId => course.modules.includes(moduleId)).length;
      // Calculate the progress
      const totalModules = course.modules.length;
      const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
      
      // Create a new object with course details and progress
      return {
        _id: course._id,
        title: course.title,
        imageLink:course.imageLink,
        description: course.description,
        modules: course.modules,
        tutor: course.tutor,
        progress
      };
    }));

    res.status(200).json(coursesWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// View Course Modules (if enrolled)
router.get('/courses/:courseId/modules/:userId', async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    
    // Find the course and populate its modules
    const course = await Course.findOne({ _id: courseId, enrolledStudents: userId }).populate('modules');

    if (!course) {
      return res.status(404).json({ message: 'Course not found or student not enrolled in the course' });
    }
  
    // Fetch the student's details
    const student = await Student.findOne({ userId });

    // Create a map to store completion status for each module
    const moduleCompletionStatus = new Map();

    // Populate the completion status for each module
    student.modulesFinished.forEach(moduleId => {
      moduleCompletionStatus.set(moduleId.toString(), true);
    });

    // Create a new array to hold module details along with completion status
    const modulesWithCompletionStatus = course.modules.map(module => {
      const isCompleted = moduleCompletionStatus.has(module._id.toString());
      return { ...module.toObject(), isCompleted };
    });

    // Include course information in the response
    const response = {
      course: course.toObject(),
      modules: modulesWithCompletionStatus
    };

    // Return the response
    res.status(200).json(response);
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

router.get("/modules/:moduleId/:userId", async (req, res) => {
  try {
    const { moduleId, userId } = req.params;

    // Find the module
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Check if the student has completed the module
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const isCompleted = student.modulesFinished.includes(moduleId);

    return res.status(200).json({ module, isCompleted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update Finished Modules for a Student
router.put('/students/:userId/modules/:moduleId', async (req, res) => {
  try {
    const { userId, moduleId } = req.params;

    // Check if student exists
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Check if module is already finished by the student
    if (student.modulesFinished.includes(moduleId)) {
      return res.status(400).json({ message: 'Module already finished by the student' });
    }

    // Add module to the student's finished modules list
    student.modulesFinished.push(moduleId);
    await student.save();

    res.status(200).json({ message: 'Module finished successfully for the student' });
  } catch (error) {
    console.error('Error updating finished modules for student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Remove Module from Finished Modules for a Student
router.delete('/students/:userId/modules/:moduleId', async (req, res) => {
  try {
    const { userId, moduleId } = req.params;

    // Check if student exists
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Check if module is in the student's finished modules list
    const index = student.modulesFinished.indexOf(moduleId);
    if (index === -1) {
      return res.status(400).json({ message: 'Module not found in student\'s finished modules list' });
    }

    // Remove module from student's finished modules list
    student.modulesFinished.splice(index, 1);
    await student.save();

    res.status(200).json({ message: 'Module removed successfully from the student\'s finished modules list' });
  } catch (error) {
    console.error('Error removing module from finished modules for student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;