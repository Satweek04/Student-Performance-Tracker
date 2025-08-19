const { User, Student, Teacher } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory OTP store (use Redis or DB in production)
const otpStore = new Map();

// Login with email + password
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials', message: 'The provided email or password is incorrect', code: 401 });
  }

  let teacherData = null;
  if (user.role === 'teacher') {
    teacherData = await Teacher.findOne({ where: { userId: user.id } });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

  const userResponse = {
    ...user.toJSON(),
    ...(teacherData ? {
      teacherId: teacherData.teacherId,
      subjects: teacherData.subjects
    } : {})
  };

  res.json({ token, user: userResponse, expiresIn: '24h' });
};

// Register student
const gradeSubjectsMap = {
  "6th Grade": [
    "Mathematics",
    "Science",               // General science
    "English",
    "History",
    "Geography",
    "Physical Education",
    "Art",
    "Music"
  ],
  "7th Grade": [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education",
    "Art"
  ],
  "8th Grade": [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Music",
    "Physical Education"
  ],
  "9th Grade": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education"
  ],
  "10th Grade": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education"
  ],
  "11th Grade": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education"
  ],
  "12th Grade": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education"
  ]
};


exports.register = async (req, res) => {
  const { email, password, name, grade } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const id = `user_${uuidv4()}`;
  const studentId = `STU${Math.floor(Math.random() * 100000)}`;

  try {
    const user = await User.create({ id, email, name, password: hash, role: 'student' });

    const subjects = gradeSubjectsMap[grade] || [];

    await Student.create({ studentId, grade, userId: user.id, subjects });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user, expiresIn: '24h' });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed', message: error.message, code: 400 });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found', message: '', code: 404 });
  res.json(user);
};

// Send OTP to email


// Verify OTP only
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { otp, expiry });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Dear User,

Your One-Time Password (OTP) for accessing the EduManage portal is: ${otp}

This code is valid for the next 5 minutes. Please do not share this code with anyone.  
EduManage provides secure access to performance reports, attendance records, and exam results for administrators, teachers, and students.

If you did not request this code, please contact our support team immediately.

Regards,  
The EduManage Team`,
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};

exports.loginWithOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ error: 'OTP not found or expired' });
  if (record.expiry < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  otpStore.delete(email);

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  let teacherData = null;
  if (user.role === 'teacher') {
    teacherData = await Teacher.findOne({ where: { userId: user.id } });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

  const userResponse = {
    ...user.toJSON(),
    ...(teacherData ? { teacherId: teacherData.teacherId, subjects: teacherData.subjects } : {}),
  };

  res.json({ token, user: userResponse, expiresIn: '24h' });
};
