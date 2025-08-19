import React, { useEffect, useState } from 'react';
import { Award, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Mark, Attendance, PerformanceSuggestion } from '../../types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [performance, setPerformance] = useState<PerformanceSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [marksData, attendanceData, performanceData] = await Promise.all([
        apiService.getStudentMarks(),
        apiService.getStudentAttendance(),
        apiService.getPerformanceSuggestions(),
      ]);
      setMarks(marksData);
      setAttendance(attendanceData);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const student = user as any;
  const recentMarks = marks.slice(0, 5);
  const recentAttendance = attendance.slice(0, 5);

  // Calculate stats
  const totalAttendance = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

  const averageMarks = marks.length > 0 
    ? marks.reduce((sum, mark) => sum + (mark.marks / mark.totalMarks) * 100, 0) / marks.length 
    : 0;

  const stats = [
    {
      title: 'Average Grade',
      value: performance?.overall?.grade || 'N/A',
      icon: Award,
      color: 'bg-blue-500',
    },
    {
      title: 'Attendance Rate',
      value: `${attendancePercentage.toFixed(1)}%`,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Subjects Enrolled',
      value: student?.subjects?.length || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'Performance',
      value: `${averageMarks.toFixed(1)}%`,
      icon: TrendingUp,
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
          Here's your academic progress overview
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

      {/* Performance Overview */}
      {performance && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Overall Performance
              </h3>
              <div className="text-3xl font-bold text-[#0bf70d] mb-2">
                {performance.overall.grade}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {performance.overall.percentage.toFixed(1)}% Average
              </div>
              <div className="space-y-1">
                {performance.overall.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                    • {suggestion}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Subject Performance
              </h3>
              <div className="space-y-2">
                {performance.subjects.map((subject, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {subject.subject}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#0bf70d]">
                        {subject.grade}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {subject.average.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Marks
          </h2>
          <div className="space-y-3">
            {recentMarks.length > 0 ? (
              recentMarks.map((mark) => (
                <div key={mark.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {mark.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mark.examType} • {mark.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0bf70d]">
                      {mark.marks}/{mark.totalMarks}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((mark.marks / mark.totalMarks) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
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
              recentAttendance.map((att) => (
                <div key={att.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {att.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {att.date}
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
              ))
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