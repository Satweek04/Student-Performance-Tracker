import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
  Student,
  Teacher,
  Mark,
  Attendance,
  PerformanceSuggestion,
  ApiResponse,
  PaginatedResponse,
  Message
} from '../types';
import { API_CONFIG, STORAGE_KEYS } from './config';

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  // ✅ Improved error handler
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      const error: any = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status; // attach http status
      error.data = errorData;         // attach full error payload
      throw error;
    }
    return response.json();
  }

  // ================= AUTH =================
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });

    const data = await this.handleResponse<LoginResponse>(response);

    this.token = data.token;
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return data;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    this.token = result.token;
    localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));

    return result;
  }

  // OTP*************************************************

  // ✅ Send OTP to Email
  async sendOtp(params: { email: string }): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/send-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // ✅ Login via OTP
  async loginWithOtp(params: { email: string; otp: string }): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    const data = await this.handleResponse<LoginResponse>(response);

    this.token = data.token;
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return data;
  }
  // *****************************************************

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // ================= ADMIN =================
  async getAllTeachers(page = 1, limit = 10): Promise<PaginatedResponse<Teacher>> {
    const response = await fetch(`${this.baseURL}/admin/teachers?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<Teacher>>(response);
  }

  async getAllStudents(page = 1, limit = 10, grade?: string): Promise<PaginatedResponse<Student>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (grade) params.append('grade', grade);

    const response = await fetch(`${this.baseURL}/admin/students?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<Student>>(response);
  }

  async addTeacher(teacherData: {
    email: string;
    name: string;
    subjects: string[];
    password?: string;
  }): Promise<Teacher> {
    const response = await fetch(`${this.baseURL}/admin/teachers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });

    return this.handleResponse<Teacher>(response);
  }

  async assignTeacherStudentsSubjects(data: {
    teacherId: string;
    studentIds: string[];
    subjects: string[];
  }): Promise<void> {
    const response = await fetch(`${this.baseURL}/admin/assign-teacher-students-subjects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Assignment failed');
    }
  }

  // ================= TEACHER =================
  async getAssignedStudents(subject?: string): Promise<Student[]> {
    const params = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    const response = await fetch(`${this.baseURL}/teacher/students${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Student[]>(response);
  }

  async addMark(markData: {
    studentId: string;
    subject: string;
    marks: number;
    totalMarks: number;
    examType: 'quiz' | 'midterm' | 'final' | 'assignment';
    date?: string;
    teacherId?: string;
  }): Promise<Mark> {
    const response = await fetch(`${this.baseURL}/teacher/marks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(markData),
    });

    return this.handleResponse<Mark>(response);
  }

  async addAttendance(attendanceData: {
    studentId: string;
    subject: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    teacherId?: string;
  }): Promise<Attendance> {
    const response = await fetch(`${this.baseURL}/teacher/attendance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    });

    return this.handleResponse<Attendance>(response);
  }

  // ✅ Needed for batch marking
  async addBatchAttendance(records: {
    studentId: string;
    subject: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    teacherId?: string;
  }[]): Promise<ApiResponse<{ success: boolean }>> {
    const response = await fetch(`${this.baseURL}/teacher/attendance/batch`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(records),
    });
    return this.handleResponse<ApiResponse<{ success: boolean }>>(response);
  }

  async getMarksByTeacher(studentId?: string, subject?: string, examType?: string): Promise<Mark[]> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (subject) params.append('subject', subject);
    if (examType) params.append('examType', examType);

    const queryString = params.toString();
    const response = await fetch(`${this.baseURL}/teacher/marks${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Mark[]>(response);
  }

  async getAttendanceByTeacher(studentId?: string, subject?: string, date?: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (subject) params.append('subject', subject);
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const response = await fetch(`${this.baseURL}/teacher/attendance${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Attendance[]>(response);
  }

  async getTeacherProfile(): Promise<Teacher> {
    const response = await fetch(`${this.baseURL}/teacher/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Teacher>(response);
  }

  // ================= STUDENT =================
  async getStudentMarks(subject?: string, examType?: string): Promise<Mark[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (examType) params.append('examType', examType);

    const queryString = params.toString();
    const response = await fetch(`${this.baseURL}/student/marks${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Mark[]>(response);
  }

  async getStudentAttendance(subject?: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const response = await fetch(`${this.baseURL}/student/attendance${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Attendance[]>(response);
  }

  async getPerformanceSuggestions(): Promise<PerformanceSuggestion> {
    const response = await fetch(`${this.baseURL}/student/performance`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PerformanceSuggestion>(response);
  }




  // Add these methods to your ApiService class

// ================= MESSAGES =================
async getConversations(): Promise<any[]> {
  const response = await fetch(`${this.baseURL}/messages/conversations`, {
    headers: this.getAuthHeaders(),
  });
  return this.handleResponse<any[]>(response);
}

async getMessages(chatGroupId?: string, userId?: string): Promise<Message[]> {
  const params = new URLSearchParams();
  if (chatGroupId) params.append('chatGroupId', chatGroupId);
  if (userId) params.append('userId', userId);
  
  const queryString = params.toString();
  const response = await fetch(`${this.baseURL}/messages${queryString ? `?${queryString}` : ''}`, {
    headers: this.getAuthHeaders(),
  });
  return this.handleResponse<Message[]>(response);
}

async sendMessage(messageData: {
  messageText: string;
  receiverId?: string;
  chatGroupId?: string;
}): Promise<any> {
  const response = await fetch(`${this.baseURL}/messages/send`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(messageData),
  });
  return this.handleResponse<any>(response);
}

async createGroup(groupData: {
  name: string;
  studentIds: string[];
}): Promise<any> {
  const response = await fetch(`${this.baseURL}/messages/groups`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(groupData),
  });
  return this.handleResponse<any>(response);
}


// Add these to your ApiService class

// For students to get teachers
async getAvailableTeachers(): Promise<any[]> {
  const response = await fetch(`${this.baseURL}/student/teachers`, {
    headers: this.getAuthHeaders(),
  });
  return this.handleResponse<any[]>(response);
}

// For students to get classmates
async getClassmates(): Promise<any[]> {
  const response = await fetch(`${this.baseURL}/student/classmates`, {
    headers: this.getAuthHeaders(),
  });
  return this.handleResponse<any[]>(response);
}


}

export const apiService = new ApiService();
export default apiService;
