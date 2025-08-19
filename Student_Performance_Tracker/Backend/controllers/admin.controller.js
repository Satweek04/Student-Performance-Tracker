const { User, Teacher, Student } = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// List all teachers with pagination
exports.listTeachers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const { rows, count } = await Teacher.findAndCountAll({
    include: [{ model: User, attributes: ['name', 'email'] }],
    offset: Number(offset),
    limit: Number(limit),
  });

  const teachers = rows.map(teacher => {
    const t = teacher.toJSON();
    t.name = t.User?.name || '';
    t.email = t.User?.email || '';
    delete t.User;
    return t;
  });

  res.json({
    teachers,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / limit),
  });
};

// Add a new teacher user and teacher record
exports.addTeacher = async (req, res) => {
  const { email, name, subjects, password } = req.body;
  if (!email || !name || !subjects) {
    return res.status(400).json({ error: "Missing fields", message: "email, name, subjects required", code: 400 });
  }
  const hashed = await bcrypt.hash(password || 'password123', 10);
  try {
    const id = `user_${uuidv4()}`;
    const teacherId = `TCH${Math.floor(Math.random() * 100000)}`;
    const user = await User.create({ id, email, name, password: hashed, role: 'teacher' });
    const teacher = await Teacher.create({ teacherId, userId: user.id, subjects });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: 'Creation failed', message: error.message });
  }
};

// List all students with pagination and optional grade filter
exports.listStudents = async (req, res) => {
  const { page = 1, limit = 10, grade } = req.query;
  const offset = (page - 1) * limit;
  const where = {};
  if (grade) where.grade = grade;
  const { rows, count } = await Student.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['name', 'email'] }],
    offset: Number(offset),
    limit: Number(limit),
  });

  const students = rows.map(student => {
    const s = student.toJSON();
    s.name = s.User?.name || '';
    s.email = s.User?.email || '';
    delete s.User;
    return s;
  });

  res.json({
    students,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / limit),
  });
};

// Assign students to a specific teacher (legacy route)
exports.assignStudentsToTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { assignments } = req.body; // array of { studentId, subjects: [] }

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({ error: 'Assignments array required' });
  }

  try {
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    for (const { studentId, subjects } of assignments) {
      await teacher.addStudent(studentId, { through: { subjects: subjects || [] } });
    }

    res.json({ message: 'Students and subjects assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// New bulk assign method for dashboard modal
exports.assignTeacherStudentsSubjects = async (req, res) => {
  const { teacherId, studentIds, subjects } = req.body;

  if (!teacherId || !Array.isArray(studentIds) || studentIds.length === 0 || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: 'teacherId, non-empty studentIds and subjects arrays are required' });
  }

  try {
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    for (const studentId of studentIds) {
      await teacher.addStudent(studentId, { through: { subjects } });
    }

    res.json({ message: 'Teacher assigned to students with subjects successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};
