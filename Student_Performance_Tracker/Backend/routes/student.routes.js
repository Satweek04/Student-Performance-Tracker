const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const markCtrl = require('../controllers/mark.controller');
const attendanceCtrl = require('../controllers/attendance.controller');
const studentCtrl = require('../controllers/student.controller');

router.get('/profile', auth(['student']), studentCtrl.getStudentProfile);
router.get('/marks', auth(['student']), markCtrl.listStudentMarks);
router.get('/attendance', auth(['student']), attendanceCtrl.listStudentAttendance);
router.get('/performance', auth(['student']), studentCtrl.getPerformanceSuggestions);

// NEW: Add these routes for messaging
router.get('/teachers', auth(['student']), studentCtrl.getAvailableTeachers);
router.get('/classmates', auth(['student']), studentCtrl.getClassmates);

module.exports = router;
