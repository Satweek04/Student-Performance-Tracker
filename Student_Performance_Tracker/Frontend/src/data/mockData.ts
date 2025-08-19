import { Student, Teacher, Admin, Mark, Attendance, PerformanceSuggestion } from '../types';

// Mock Users
export const mockAdmin: Admin = {
  id: 'admin_001',
  email: 'admin@school.com',
  name: 'System Administrator',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher_001',
    email: 'john.math@school.com',
    name: 'John Mathematics',
    role: 'teacher',
    teacherId: 'TCH001',
    subjects: ['Mathematics', 'Physics'],
    assignedStudents: ['student_001', 'student_002', 'student_003'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'teacher_002',
    email: 'sarah.science@school.com',
    name: 'Sarah Wilson',
    role: 'teacher',
    teacherId: 'TCH002',
    subjects: ['Chemistry', 'Biology'],
    assignedStudents: ['student_001', 'student_002', 'student_004'],
    createdAt: '2024-01-16T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
  },
  {
    id: 'teacher_003',
    email: 'mike.english@school.com',
    name: 'Mike Johnson',
    role: 'teacher',
    teacherId: 'TCH003',
    subjects: ['English', 'History'],
    assignedStudents: ['student_003', 'student_004', 'student_005'],
    createdAt: '2024-01-17T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z',
  },
];

export const mockStudents: Student[] = [
  {
    id: 'student_001',
    email: 'alice.student@school.com',
    name: 'Alice Johnson',
    role: 'student',
    studentId: 'STU001',
    grade: '10th Grade',
    subjects: ['Mathematics', 'Chemistry', 'English'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'student_002',
    email: 'bob.student@school.com',
    name: 'Bob Smith',
    role: 'student',
    studentId: 'STU002',
    grade: '10th Grade',
    subjects: ['Mathematics', 'Physics', 'Biology'],
    createdAt: '2024-02-02T00:00:00Z',
    updatedAt: '2024-02-02T00:00:00Z',
  },
  {
    id: 'student_003',
    email: 'carol.student@school.com',
    name: 'Carol Davis',
    role: 'student',
    studentId: 'STU003',
    grade: '11th Grade',
    subjects: ['Mathematics', 'English', 'History'],
    createdAt: '2024-02-03T00:00:00Z',
    updatedAt: '2024-02-03T00:00:00Z',
  },
  {
    id: 'student_004',
    email: 'david.student@school.com',
    name: 'David Wilson',
    role: 'student',
    studentId: 'STU004',
    grade: '11th Grade',
    subjects: ['Chemistry', 'Biology', 'History'],
    createdAt: '2024-02-04T00:00:00Z',
    updatedAt: '2024-02-04T00:00:00Z',
  },
  {
    id: 'student_005',
    email: 'emma.student@school.com',
    name: 'Emma Brown',
    role: 'student',
    studentId: 'STU005',
    grade: '12th Grade',
    subjects: ['English', 'History', 'Art'],
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-02-05T00:00:00Z',
  },
];

export const mockMarks: Mark[] = [
  // Alice Johnson's marks
  {
    id: 'mark_001',
    studentId: 'student_001',
    subject: 'Mathematics',
    marks: 85,
    totalMarks: 100,
    examType: 'midterm',
    date: '2024-03-15',
    teacherId: 'teacher_001',
  },
  {
    id: 'mark_002',
    studentId: 'student_001',
    subject: 'Chemistry',
    marks: 92,
    totalMarks: 100,
    examType: 'midterm',
    date: '2024-03-16',
    teacherId: 'teacher_002',
  },
  {
    id: 'mark_003',
    studentId: 'student_001',
    subject: 'English',
    marks: 78,
    totalMarks: 100,
    examType: 'quiz',
    date: '2024-03-10',
    teacherId: 'teacher_003',
  },
  // Bob Smith's marks
  {
    id: 'mark_004',
    studentId: 'student_002',
    subject: 'Mathematics',
    marks: 76,
    totalMarks: 100,
    examType: 'midterm',
    date: '2024-03-15',
    teacherId: 'teacher_001',
  },
  {
    id: 'mark_005',
    studentId: 'student_002',
    subject: 'Physics',
    marks: 88,
    totalMarks: 100,
    examType: 'assignment',
    date: '2024-03-12',
    teacherId: 'teacher_001',
  },
  {
    id: 'mark_006',
    studentId: 'student_002',
    subject: 'Biology',
    marks: 94,
    totalMarks: 100,
    examType: 'final',
    date: '2024-03-20',
    teacherId: 'teacher_002',
  },
  // Additional marks for other students
  {
    id: 'mark_007',
    studentId: 'student_003',
    subject: 'Mathematics',
    marks: 90,
    totalMarks: 100,
    examType: 'midterm',
    date: '2024-03-15',
    teacherId: 'teacher_001',
  },
  {
    id: 'mark_008',
    studentId: 'student_003',
    subject: 'English',
    marks: 87,
    totalMarks: 100,
    examType: 'assignment',
    date: '2024-03-18',
    teacherId: 'teacher_003',
  },
];

export const mockAttendance: Attendance[] = [
  // March 2024 attendance for Alice Johnson
  {
    id: 'att_001',
    studentId: 'student_001',
    subject: 'Mathematics',
    date: '2024-03-01',
    status: 'present',
    teacherId: 'teacher_001',
  },
  {
    id: 'att_002',
    studentId: 'student_001',
    subject: 'Mathematics',
    date: '2024-03-03',
    status: 'present',
    teacherId: 'teacher_001',
  },
  {
    id: 'att_003',
    studentId: 'student_001',
    subject: 'Mathematics',
    date: '2024-03-05',
    status: 'absent',
    teacherId: 'teacher_001',
  },
  {
    id: 'att_004',
    studentId: 'student_001',
    subject: 'Chemistry',
    date: '2024-03-01',
    status: 'present',
    teacherId: 'teacher_002',
  },
  {
    id: 'att_005',
    studentId: 'student_001',
    subject: 'Chemistry',
    date: '2024-03-03',
    status: 'late',
    teacherId: 'teacher_002',
  },
  // March 2024 attendance for Bob Smith
  {
    id: 'att_006',
    studentId: 'student_002',
    subject: 'Mathematics',
    date: '2024-03-01',
    status: 'present',
    teacherId: 'teacher_001',
  },
  {
    id: 'att_007',
    studentId: 'student_002',
    subject: 'Mathematics',
    date: '2024-03-03',
    status: 'present',
    teacherId: 'teacher_001',
  },
  {
    id: 'att_008',
    studentId: 'student_002',
    subject: 'Physics',
    date: '2024-03-02',
    status: 'present',
    teacherId: 'teacher_001',
  },
  {
    id: 'att_009',
    studentId: 'student_002',
    subject: 'Biology',
    date: '2024-03-04',
    status: 'present',
    teacherId: 'teacher_002',
  },
];

export const mockPerformanceSuggestions: Record<string, PerformanceSuggestion> = {
  student_001: {
    overall: {
      grade: 'B+',
      percentage: 85.0,
      suggestions: [
        'Great performance overall! Keep up the excellent work.',
        'Consider spending more time on English to improve your overall grade.',
        'Your Chemistry performance is outstanding - maintain this level.',
      ],
    },
    subjects: [
      {
        subject: 'Mathematics',
        average: 85,
        grade: 'B',
        suggestions: [
          'Good grasp of basic concepts',
          'Practice more complex problem-solving',
          'Review algebra fundamentals',
        ],
      },
      {
        subject: 'Chemistry',
        average: 92,
        grade: 'A-',
        suggestions: [
          'Excellent understanding of chemical reactions',
          'Continue with practical experiments',
          'Strong foundation in organic chemistry',
        ],
      },
      {
        subject: 'English',
        average: 78,
        grade: 'C+',
        suggestions: [
          'Work on essay writing structure',
          'Expand vocabulary through reading',
          'Practice grammar exercises',
        ],
      },
    ],
  },
  student_002: {
    overall: {
      grade: 'B+',
      percentage: 86.0,
      suggestions: [
        'Excellent performance in Biology! Outstanding work.',
        'Mathematics needs some attention - consider extra practice.',
        'Physics shows good understanding of concepts.',
      ],
    },
    subjects: [
      {
        subject: 'Mathematics',
        average: 76,
        grade: 'C+',
        suggestions: [
          'Focus on problem-solving strategies',
          'Practice daily math exercises',
          'Seek help with challenging topics',
        ],
      },
      {
        subject: 'Physics',
        average: 88,
        grade: 'B+',
        suggestions: [
          'Strong conceptual understanding',
          'Continue with practical applications',
          'Excellent work on mechanics',
        ],
      },
      {
        subject: 'Biology',
        average: 94,
        grade: 'A',
        suggestions: [
          'Outstanding performance in all areas',
          'Consider advanced biology topics',
          'Excellent lab work and understanding',
        ],
      },
    ],
  },
};

// Helper functions for mock API
export const getMockUser = (email: string, password: string) => {
  const allUsers = [mockAdmin, ...mockTeachers, ...mockStudents];
  return allUsers.find(user => user.email === email);
};

export const getMockStudentsByTeacher = (teacherId: string) => {
  const teacher = mockTeachers.find(t => t.id === teacherId);
  if (!teacher) return [];
  
  return mockStudents.filter(student => 
    teacher.assignedStudents.includes(student.id)
  );
};

export const getMockMarksByStudent = (studentId: string) => {
  return mockMarks.filter(mark => mark.studentId === studentId);
};

export const getMockAttendanceByStudent = (studentId: string) => {
  return mockAttendance.filter(att => att.studentId === studentId);
};

export const getMockMarksByTeacher = (teacherId: string) => {
  return mockMarks.filter(mark => mark.teacherId === teacherId);
};

export const getMockAttendanceByTeacher = (teacherId: string) => {
  return mockAttendance.filter(att => att.teacherId === teacherId);
};