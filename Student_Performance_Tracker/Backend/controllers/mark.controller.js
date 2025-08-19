const { User, Teacher, Mark,Student } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Teacher: Add mark
exports.addMark = async (req, res) => {
  const { studentId, subject, marks, totalMarks, examType, date } = req.body;
  if (!studentId || !subject || marks === undefined || !totalMarks || !examType) {
    return res.status(400).json({ error: "Missing fields", code: 400 });
  }
  try {
    // Find teacher record matching the logged-in user
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
    if (!teacher) {
      return res.status(403).json({ error: "Teacher profile not found for current user" });
    }

    const mark = await Mark.create({
      id: `mark_${uuidv4()}`,
      studentId, subject, marks, totalMarks, examType,
      date: date || new Date().toISOString().slice(0, 10),
      teacherId: teacher.teacherId   // use teacherId from Teacher table
    });
    res.status(201).json(mark);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// Teacher: List marks
exports.listMarks = async (req, res) => {
  const { studentId, subject, examType } = req.query;
  const where = {};
  if (studentId) where.studentId = studentId;
  if (subject) where.subject = subject;
  if (examType) where.examType = examType;
  try {
    const marks = await Mark.findAll({ where,
      include: [
        {
          model: Student,
          attributes: ['studentId'], // include studentId or other student fields as needed
          include: [
            {
              model: User,
              attributes: ['name'], // include student's name here
            }
          ]
        }
      ]
     });
     const result = marks.map(record => {
      const att = record.toJSON();
      att.studentName = att.Student?.User?.name || 'Unknown Student';
      delete att.Student;
      return att;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// Student: List own marks
exports.listStudentMarks = async (req, res) => {
  const { subject, examType } = req.query;
  
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student record not found' });

    const where = { studentId: student.studentId };
    if (subject) where.subject = subject;
    if (examType) where.examType = examType;

    const marks = await Mark.findAll({ where });
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
