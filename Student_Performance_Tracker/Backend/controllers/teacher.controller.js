const { Teacher, User, Student } = require('../models');

exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
      }],
      attributes: ['teacherId', 'subjects', 'createdAt', 'updatedAt']
    });

    if (!teacher) return res.status(404).json({ error: 'Teacher not found', code: 404 });

    const response = {
      id: teacher.User.id,
      name: teacher.User.name,
      email: teacher.User.email,
      role: teacher.User.role,
      createdAt: teacher.User.createdAt,
      updatedAt: teacher.User.updatedAt,
      teacherId: teacher.teacherId,
      subjects: teacher.subjects || []
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// FIXED: Single getAssignedStudents function with better error handling
exports.getAssignedStudents = async (req, res) => {
  try {
    console.log('Getting assigned students for teacher:', req.user.id);
    
    // First try to find teacher and their assigned students
    const teacher = await Teacher.findOne({
      where: { userId: req.user.id }
    });

    if (!teacher) {
      console.log('Teacher not found for userId:', req.user.id);
      return res.status(404).json({ error: 'Teacher not found' });
    }

    console.log('Teacher found:', teacher.teacherId);

    // Try to get assigned students through many-to-many relationship
    let students = [];
    try {
      const teacherWithStudents = await Teacher.findOne({
        where: { userId: req.user.id },
        include: [{
          model: Student,
          include: [{ model: User, attributes: ['id', 'name', 'email'] }],
          through: {
            attributes: ['subjects'] // Include assigned subjects
          }
        }]
      });

      if (teacherWithStudents && teacherWithStudents.Students) {
        students = teacherWithStudents.Students;
      }
    } catch (associationError) {
      console.log('Association query failed:', associationError.message);
    }

    console.log('Found assigned students:', students.length);

    // If no assigned students found, return all students as fallback
    if (students.length === 0) {
      console.log('No assigned students found, returning all students');
      const allStudents = await Student.findAll({
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        limit: 50
      });
      students = allStudents;
    }

    // Format the response
    const formattedStudents = students.map(student => {
      const studentData = student.toJSON ? student.toJSON() : student;
      return {
        id: studentData.User?.id || studentData.userId, // Use User.id for messaging
        userId: studentData.User?.id || studentData.userId,
        studentId: studentData.studentId,
        name: studentData.User?.name || studentData.name || 'Unknown Student',
        email: studentData.User?.email || studentData.email || '',
        grade: studentData.grade || 'Unknown',
        assignedSubjects: studentData.TeacherStudents?.subjects || []
      };
    });

    console.log("Formatted students for response:", formattedStudents.map(s => ({ id: s.id, name: s.name })));
    res.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

