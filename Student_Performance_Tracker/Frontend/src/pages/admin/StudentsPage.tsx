import React, { useEffect, useState } from 'react';
import { Search, Mail, GraduationCap, BookOpen } from 'lucide-react';
import { apiService } from '../../services/api';
import { Student } from '../../types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiService.getAllStudents();
      setStudents(response.students || response.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    // Defensive nullish checks with default ''
    const name = student.name ?? '';
    const email = student.email ?? '';
    const studentId = student.studentId ?? '';
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      studentId.toLowerCase().includes(term);

    const matchesGrade = !selectedGrade || student.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const grades = Array.from(new Set(students.map(s => s.grade))).sort();

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
          Students Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all students in the system
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search students by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Grades</option>
          {grades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#0bf70d] rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {student.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {student.name || 'No Name'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {student.studentId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={16} />
                <span>{student.email || 'N/A'}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <GraduationCap size={16} />
                <span>{student.grade || 'N/A'}</span>
              </div>

              <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen size={16} className="mt-0.5" />
                <div>
                  <p className="font-medium">Subjects:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(student.subjects ?? []).map((subject) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-[#0bf70d]/10 text-[#0bf70d] text-xs rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Joined: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No students found matching your search criteria.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0bf70d]">{students.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0bf70d]">{grades.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Grades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0bf70d]">
              {Array.from(new Set(students.flatMap(s => s.subjects ?? []))).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Subjects Offered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
