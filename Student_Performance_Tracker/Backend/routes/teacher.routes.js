const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const markCtrl = require('../controllers/mark.controller');
const attendanceCtrl = require('../controllers/attendance.controller');
const teacherCtrl = require('../controllers/teacher.controller');

// Profile
router.get('/profile', auth(['teacher']), teacherCtrl.getTeacherProfile);

// Assigned Students: (You can implement subject filter logic further)
// router.get('/students', auth(['teacher']), (req, res) => res.status(501).json({ error: 'Not Implemented' }));

// Marks
router.get('/marks', auth(['teacher']), markCtrl.listMarks);
router.post('/marks', auth(['teacher']), markCtrl.addMark);

// Attendance
router.get('/attendance', auth(['teacher']), attendanceCtrl.listAttendance);
router.post('/attendance', auth(['teacher']), attendanceCtrl.addAttendance);
router.post('/attendance/batch',auth(['teacher']), attendanceCtrl.addBatchAttendance);

router.get('/students', auth(['teacher']), teacherCtrl.getAssignedStudents);

module.exports = router;
