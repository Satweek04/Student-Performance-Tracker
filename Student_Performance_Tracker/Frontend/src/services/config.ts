// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  DEV_URL: 'http://localhost:3000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',

  // Admin endpoints
  ADMIN: {
    TEACHERS: '/admin/teachers',
    STUDENTS: '/admin/students',
    USERS: '/admin/users',
    STATS: '/admin/stats',
  },

  // Teacher endpoints
  TEACHER: {
    STUDENTS: '/teacher/students',
    MARKS: '/teacher/marks',
    ATTENDANCE: '/teacher/attendance',
    SUBJECTS: '/teacher/subjects',
  },

  // Student endpoints
  STUDENT: {
    MARKS: '/student/marks',
    ATTENDANCE: '/student/attendance',
    PERFORMANCE: '/student/performance',
    PROFILE: '/student/profile',
  },

  // Common endpoints
  SUBJECTS: '/subjects',
  GRADES: '/grades',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'sms_token',
  USER: 'sms_user',
  THEME: 'sms_theme',
  REFRESH_TOKEN: 'sms_refresh_token',
};

// Theme configuration
export const THEME_CONFIG = {
  LIGHT: {
    primary: '#0bf70d',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
  },
  DARK: {
    primary: '#0bf70d',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#adb5bd',
    border: '#495057',
  },
};

// App configuration
export const APP_CONFIG = {
  NAME: 'School Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Complete school management solution',
  CONTACT_EMAIL: 'support@schoolmanagement.com',
  ITEMS_PER_PAGE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
};

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
};

// Grade boundaries
export const GRADE_BOUNDARIES = {
  'A+': 95,
  'A': 90,
  'A-': 85,
  'B+': 80,
  'B': 75,
  'B-': 70,
  'C+': 65,
  'C': 60,
  'C-': 55,
  'D': 50,
  'F': 0,
};

// Subjects list
export const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
];

// Grades list
export const GRADES = [
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
];

// Exam types
export const EXAM_TYPES = [
  'quiz',
  'midterm',
  'final',
  'assignment',
] as const;

// Attendance status
export const ATTENDANCE_STATUS = [
  'present',
  'absent',
  'late',
] as const;

export default {
  API_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS,
  THEME_CONFIG,
  APP_CONFIG,
  VALIDATION_RULES,
  GRADE_BOUNDARIES,
  SUBJECTS,
  GRADES,
  EXAM_TYPES,
  ATTENDANCE_STATUS,
};