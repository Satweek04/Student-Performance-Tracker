const { Student, User, Mark, Teacher } = require('../models');
const { Op } = require('sequelize');

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [User]
    });
    if (!student) return res.status(404).json({ error: 'Student not found', code: 404 });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// NEW: Get available teachers for student to message
exports.getAvailableTeachers = async (req, res) => {
  try {
    console.log('Getting available teachers for student:', req.user.id);
    
    const teachers = await Teacher.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      attributes: ['teacherId', 'subjects'],
      limit: 50
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.User.id, // Use User.id for messaging
      userId: teacher.User.id,
      teacherId: teacher.teacherId,
      name: teacher.User.name || 'Unknown Teacher',
      email: teacher.User.email || '',
      subjects: teacher.subjects || []
    }));

    console.log(`Found ${formattedTeachers.length} teachers`);
    res.json(formattedTeachers);
  } catch (error) {
    console.error("Error fetching available teachers:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// NEW: Get classmates for student
exports.getClassmates = async (req, res) => {
  try {
    console.log('Getting classmates for student:', req.user.id);
    
    // First get current student to find their grade
    const currentStudent = await Student.findOne({
      where: { userId: req.user.id },
      attributes: ['grade']
    });

    if (!currentStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all students in the same grade (excluding current student)
    const classmates = await Student.findAll({
      where: { 
        grade: currentStudent.grade,
        userId: { [Op.ne]: req.user.id } // Exclude current student
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      attributes: ['studentId', 'grade'],
      limit: 50
    });

    const formattedClassmates = classmates.map(student => ({
      id: student.User.id, // Use User.id for messaging
      userId: student.User.id,
      studentId: student.studentId,
      name: student.User.name || 'Unknown Student',
      email: student.User.email || '',
      grade: student.grade || 'Unknown'
    }));

    console.log(`Found ${formattedClassmates.length} classmates in grade ${currentStudent.grade}`);
    res.json(formattedClassmates);
  } catch (error) {
    console.error("Error fetching classmates:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

exports.getPerformanceSuggestions = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }
    const studentId = student.studentId;

    const marks = await Mark.findAll({ where: { studentId } });

    if (!marks.length) {
      return res.json({
        overall: {
          grade: "N/A",
          percentage: 0,
          suggestions: ["No marks available yet. Please take exams to get personalized feedback."]
        },
        subjects: []
      });
    }

    const subjectMap = {};

    marks.forEach(m => {
      if (!subjectMap[m.subject]) {
        subjectMap[m.subject] = { sum: 0, count: 0, exams: [] };
      }
      const percentage = (m.marks / m.totalMarks) * 100;
      subjectMap[m.subject].sum += percentage;
      subjectMap[m.subject].count += 1;

      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C-";

      subjectMap[m.subject].exams.push({
        examName: m.examName || "Unknown",
        marksObtained: m.marks,
        maxMarks: m.totalMarks,
        percentage: Number(percentage.toFixed(2)),
        grade
      });
    });

    function generateSuggestions(avg, subject) {
      const suggestions = [];
      if (avg >= 90) {
        suggestions.push(`Excellent work in ${subject}! Keep challenging yourself with advanced problems.`);
        suggestions.push("Consider mentoring peers to deepen mastery.");
      } else if (avg >= 75) {
        suggestions.push(`Good job in ${subject}, you're on the right track.`);
        suggestions.push("Try to focus on weaker topics to improve further.");
      } else if (avg >= 50) {
        suggestions.push(`Your performance in ${subject} needs attention.`);
        suggestions.push("Allocate more study time and seek help on difficult concepts.");
        suggestions.push("Practice regularly with quizzes and exercises.");
      } else {
        suggestions.push(`Performance in ${subject} is below expectations.`);
        suggestions.push("Please consult your teacher for a tailored improvement plan.");
        suggestions.push("Don't hesitate to use extra resources and tutoring.");
      }
      return suggestions;
    }

    const subjects = Object.entries(subjectMap).map(([subject, { sum, count, exams }]) => {
      const avg = sum / count;
      let grade = "F";
      if (avg >= 90) grade = "A+";
      else if (avg >= 80) grade = "A";
      else if (avg >= 70) grade = "B+";
      else if (avg >= 60) grade = "B";
      else if (avg >= 50) grade = "C-";

      return {
        subject,
        average: Number(avg.toFixed(2)),
        grade,
        suggestions: generateSuggestions(avg, subject),
        exams
      };
    });

    const overallAvg = subjects.reduce((acc, cur) => acc + cur.average, 0) / subjects.length;
    let overallGrade = "F";
    if (overallAvg >= 90) overallGrade = "A+";
    else if (overallAvg >= 80) overallGrade = "A";
    else if (overallAvg >= 70) overallGrade = "B+";
    else if (overallAvg >= 60) overallGrade = "B";
    else if (overallAvg >= 50) overallGrade = "C-";

    const overallSuggestions = [];
    if (overallAvg >= 90) {
      overallSuggestions.push("Outstanding academic achievement! Keep exploring advanced topics.");
    } else if (overallAvg >= 75) {
      overallSuggestions.push("Good overall performance. Maintain consistency and focus on weak areas.");
    } else if (overallAvg >= 50) {
      overallSuggestions.push("You need to work harder. Create study schedules and ask for help when needed.");
    } else {
      overallSuggestions.push("Immediate attention needed. Consider additional support and focused revision.");
    }

    res.json({
      overall: {
        grade: overallGrade,
        percentage: Number(overallAvg.toFixed(2)),
        suggestions: overallSuggestions
      },
      subjects
    });

  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};
