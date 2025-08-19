const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const auth = require('../middleware/auth');

// Admin protected routes
router.get('/teachers', auth(['admin']), controller.listTeachers);    // GET all teachers
router.post('/teachers', auth(['admin']), controller.addTeacher);     // POST create teacher
router.get('/students', auth(['admin']), controller.listStudents);    // GET all students

router.post('/teachers/:teacherId/assign-students', auth(['admin']), controller.assignStudentsToTeacher);

// New route for bulk assignment from dashboard modal
router.post('/assign-teacher-students-subjects', auth(['admin']), controller.assignTeacherStudentsSubjects);

module.exports = router;
