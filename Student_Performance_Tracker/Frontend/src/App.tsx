import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';

// Auth components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TeachersPage from './pages/admin/TeachersPage';
import StudentsPage from './pages/admin/StudentsPage';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarksPage from './pages/teacher/MarksPage';
import AttendancePage from './pages/teacher/AttendancePage';
import TeacherStudentsPage from './pages/teacher/StudentsPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMarksPage from './pages/student/MarksPage';
import StudentAttendancePage from './pages/student/AttendancePage';
import PerformancePage from './pages/student/PerformancePage';
import AboutUS from './components/common/About';
import ChatPage from './components/common/ChatPage';
import { SocketProvider } from './contexts/SocketContext';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      return <Navigate to="/login" replace />;
    }
    return null;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
       <SocketProvider>
         <Router>
          <Routes>
            {/* Dashboard redirect */}
            <Route path="/" element={<DashboardRedirect />} />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <Layout requireAuth={false}>
                  <LoginForm />
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout requireAuth={false}>
                  <RegisterForm />
                </Layout>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <Layout allowedRoles={['admin']}>
                  <AdminDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <Layout allowedRoles={['admin']}>
                  <TeachersPage />
                </Layout>
              }
            />
            <Route
              path="/admin/students"
              element={
                <Layout allowedRoles={['admin']}>
                  <StudentsPage />
                </Layout>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <Layout allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </Layout>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <Layout allowedRoles={['teacher']}>
                  <TeacherStudentsPage />
                </Layout>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <Layout allowedRoles={['teacher']}>
                  <MarksPage />
                </Layout>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <Layout allowedRoles={['teacher']}>
                  <AttendancePage />
                </Layout>
              }
            />
            

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <Layout allowedRoles={['student']}>
                  <StudentDashboard />
                </Layout>
              }
            />
            <Route
              path="/student/marks"
              element={
                <Layout allowedRoles={['student']}>
                  <StudentMarksPage />
                </Layout>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <Layout allowedRoles={['student']}>
                  <StudentAttendancePage />
                </Layout>
              }
            />
            <Route
              path="/student/performance"
              element={
                <Layout allowedRoles={['student']}>
                  <PerformancePage />
                </Layout>
              }
            />

            {/* Catch all */}
            <Route
              path="/AboutUS"
              element={
                <Layout>
                  <AboutUS/>
                </Layout>
              }
            />

            <Route
  path="/chat"
  element={
    <Layout allowedRoles={['student', 'teacher']}>
      <ChatPage/>
    </Layout>
  }
/>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
       </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
