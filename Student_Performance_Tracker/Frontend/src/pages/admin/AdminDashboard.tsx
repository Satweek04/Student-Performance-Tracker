import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, Plus } from 'lucide-react';
import { apiService } from '../../services/api';
import { Student, Teacher } from '../../types';

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, teachersData] = await Promise.all([
          apiService.getAllStudents(),
          apiService.getAllTeachers(),
        ]);
        setStudents(studentsData.students ?? studentsData.data ?? []);
        setTeachers(teachersData.teachers ?? teachersData.data ?? []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Teachers',
      value: teachers.length,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Active Subjects',
      value: Array.from(new Set(teachers.flatMap(t => t.subjects))).length,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+3%',
    },
    {
      title: 'System Usage',
      value: '92%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+8%',
    },
  ];

  const allSubjects = Array.from(new Set(teachers.flatMap(t => t.subjects)));

  const toggleSelection = (
    value: string,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (array.includes(value)) {
      setArray(array.filter(v => v !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedStudentIds.length || !selectedSubjects.length) {
      alert('Please select teacher, at least one student, and at least one subject.');
      return;
    }
    setAssignLoading(true);
    try {
      await apiService.assignTeacherStudentsSubjects({
        teacherId: selectedTeacherId,
        studentIds: selectedStudentIds,
        subjects: selectedSubjects,
      });
      alert('Assignment successful');
      setShowAssignModal(false);
      setSelectedTeacherId('');
      setSelectedStudentIds([]);
      setSelectedSubjects([]);
    } catch (error) {
      console.error('Assignment failed:', error);
      alert('Failed to assign. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0bf70d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of school management system
        </p>
      </div>

      {/* Add Assignment Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center space-x-2 bg-[#0bf70d] text-white px-4 py-2 rounded-lg hover:bg-[#0ae60c] transition-colors"
        >
          <Plus size={20} />
          <span>Assign Teacher to Students & Subjects</span>
        </button>
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
            <div className="mt-4">
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Students
          </h2>
          <div className="space-y-3 max-h-64 overflow-auto">
            {students.slice(0, 20).map((student) => (
              <div key={student.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#0bf70d] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {student.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {student.name || 'No Name'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {student.grade || 'N/A'} • {student.studentId || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Teachers
          </h2>
          <div className="space-y-3 max-h-64 overflow-auto">
            {teachers.slice(0, 20).map((teacher) => (
              <div key={teacher.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#0bf70d] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {teacher.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {teacher.name || 'No Name'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(teacher.subjects ?? []).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Assign Teacher to Students and Subjects
            </h2>
            <form onSubmit={handleAssign} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Select Teacher
                </label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="" disabled>
                    -- Select Teacher --
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.teacherId}>
                      {teacher.name} ({teacher.teacherId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Select Students
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                  {students.map((student) => (
                    <div key={student.studentId} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`student_${student.studentId}`}
                        checked={selectedStudentIds.includes(student.studentId)}
                        onChange={() => toggleSelection(student.studentId, selectedStudentIds, setSelectedStudentIds)}
                        className="mr-2"
                      />
                      <label htmlFor={`student_${student.studentId}`} className="text-gray-900 dark:text-white select-none">
                        {student.name} ({student.studentId})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Select Subjects
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                  {allSubjects.map((subject) => (
                    <div key={subject} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`subject_${subject}`}
                        checked={selectedSubjects.includes(subject)}
                        onChange={() => toggleSelection(subject, selectedSubjects, setSelectedSubjects)}
                        className="mr-2"
                      />
                      <label htmlFor={`subject_${subject}`} className="text-gray-900 dark:text-white select-none">
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                  disabled={assignLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#0bf70d] hover:bg-[#0ae60c] text-white"
                  disabled={assignLoading}
                >
                  {assignLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
