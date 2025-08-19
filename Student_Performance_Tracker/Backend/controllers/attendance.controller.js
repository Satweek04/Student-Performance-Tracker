const { Attendance, Teacher, Student, User, TeacherStudents } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Teacher: Mark attendance
exports.addAttendance = async (req, res) => {
  const { studentId, subject, date, status } = req.body;
  if (!studentId || !subject || !date || !status) {
    return res.status(400).json({ error: "Missing fields", code: 400 });
  }
  try {
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
    if (!teacher) {
      return res.status(403).json({ error: "Teacher profile not found for current user" });
    }

    const att = await Attendance.create({
      id: `att_${uuidv4()}`,
      studentId,
      subject,
      date,
      status,
      teacherId: teacher.teacherId  // from Teacher table
    });
    res.status(201).json(att);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// Teacher: List attendance
exports.listAttendance = async (req, res) => {
  const { studentId, subject, date, startDate, endDate } = req.query;
  try {
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
    if (!teacher) {
      return res.status(403).json({ error: "Teacher profile not found" });
    }

    // Determine teacher's allowed subjects
    let teacherSubjectsMap = [];
    if (studentId) {
      const tsRecord = await TeacherStudents.findOne({
        where: { teacherId: teacher.teacherId, studentId }
      });
      if (!tsRecord) {
        return res.status(403).json({ error: "You are not assigned to this student" });
      }
      teacherSubjectsMap = tsRecord.subjects || [];
    } else {
      const tsRecords = await TeacherStudents.findAll({
        where: { teacherId: teacher.teacherId }
      });
      tsRecords.forEach(r => {
        teacherSubjectsMap.push(...(r.subjects || []));
      });
      teacherSubjectsMap = [...new Set(teacherSubjectsMap)];
    }

    // Build where condition
    const where = { teacherId: teacher.teacherId };
    if (studentId) where.studentId = studentId;
    if (subject) {
      if (!teacherSubjectsMap.includes(subject)) {
        return res.status(403).json({ error: "Subject not assigned to you" });
      }
      where.subject = subject;
    } else {
      where.subject = { [Op.in]: teacherSubjectsMap };
    }
    if (date) where.date = date;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

    // Fetch attendance
    const list = await Attendance.findAll({
      where,
      include: [
        {
          model: Student,
          attributes: ['studentId'],
          include: [{ model: User, attributes: ['name'] }]
        }
      ]
    });

    const result = list.map(record => {
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

// Student: List own attendance
exports.listStudentAttendance = async (req, res) => {
  const { subject, startDate, endDate } = req.query;
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const where = { studentId: student.studentId };
    if (subject) where.subject = subject;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

    const list = await Attendance.findAll({ where });
    console.log("attendance data", list, "Request id", req.user.id, student.studentId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// Teacher: Add batch attendance
exports.addBatchAttendance = async (req, res) => {
  const records = req.body; // array of {studentId, subject, date, status, teacherId}
  // console.log("////////////////////////////////\n",records,"\n/////////////////////////");
  
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "No attendance records sent" });
  }

  try {
    const teacher = await Teacher.findOne({ where: { teacherId: records[0].teacherId } });
    if (!teacher) {
      return res.status(403).json({ error: "Teacher profile not found for current user" });
    }

    for (const { studentId, subject, date } of records) {
      const exists = await Attendance.findOne({
        where: { studentId, subject, date, teacherId: teacher.teacherId }
      });
      if (exists) {
        return res.status(409).json({ error: `Attendance already marked for student ${studentId}, subject ${subject}, date ${date}` });
      }
      // Prevent past date marking
      if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({ error: "Cannot mark attendance for a past date" });
      }
    }

    const bulkRecords = records.map(rec => ({
      ...rec,
      id: `att_${uuidv4()}`
    }));

    await Attendance.bulkCreate(bulkRecords);
    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
};
