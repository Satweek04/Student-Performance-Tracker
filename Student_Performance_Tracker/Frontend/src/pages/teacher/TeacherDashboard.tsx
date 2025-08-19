import React, { useEffect, useState } from 'react';
import { Users, Award, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Student, Mark, Attendance } from '../../types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [studentsData, marksData, attendanceData] = await Promise.all([
        apiService.getAssignedStudents(),
        apiService.getMarksByTeacher(),
        apiService.getAttendanceByTeacher(),
      ]);
      setStudents(studentsData);
      setMarks(marksData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const teacher = user as any; // We know it's a teacher from auth
  const recentMarks = marks.slice(0, 5);
  const recentAttendance = attendance.slice(0, 5);

  const stats = [
    {
      title: 'My Students',
      value: students.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Subjects Teaching',
      value: teacher?.subjects?.length || 0,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Marks Recorded',
      value: marks.length,
      icon: Award,
      color: 'bg-purple-500',
    },
    {
      title: 'Attendance Records',
      value: attendance.length,
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0bf70d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your classes today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teaching Subjects */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Subjects
        </h2>
        <div className="flex flex-wrap gap-2">
          {teacher?.subjects?.map((subject: string) => (
            <span
              key={subject}
              className="px-3 py-2 bg-[#0bf70d]/10 text-[#0bf70d] rounded-full text-sm font-medium"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Marks Added
          </h2>
          <div className="space-y-3">
            {recentMarks.length > 0 ? (
              recentMarks.map((mark) => {
                const student = students.find(s => s.id === mark.studentId);
                return (
                  <div key={mark.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mark.subject} • {mark.examType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0bf70d]">
                        {mark.marks}/{mark.totalMarks}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mark.date}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No marks recorded yet
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Attendance
          </h2>
          <div className="space-y-3">
            {recentAttendance.length > 0 ? (
              recentAttendance.map((att) => {
                const student = students.find(s => s.id === att.studentId);
                return (
                  <div key={att.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {att.subject} • {att.date}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        att.status === 'present'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : att.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No attendance recorded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}