export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
  updatedAt: string;
  teacherId?: string; // Optional for students
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  grade: string;
  subjects: string[];
  assignedSubjects?: string[]; 
}

export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  subjects: string[];
  assignedStudents: string[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface Mark {
  id: string;
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment';
  date: string;
  teacherId: string;
  studentName?: string;
}

export interface Attendance {
  studentName: string;
  id: string;
  studentId: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  teacherId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  grade: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: string;
}

export interface PerformanceSuggestion {
  overall: {
    grade: string;
    percentage: number;
    suggestions: string[];
  };
  subjects: Array<{
    subject: string;
    average: number;
    grade: string;
    suggestions: string[];
    exams?:any
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  [key: string]: any; // Allow flexible response structure
  data?: T[];
  teachers?: T[];
  students?: T[];
  total: number;
  page: number;
  totalPages: number;
}


// Add this to your existing types.ts file
export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  chatGroupId?: string;
  messageText: string;
  sentAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
  };
  receiver?: {
    id: string;
    name: string;
  };
}

