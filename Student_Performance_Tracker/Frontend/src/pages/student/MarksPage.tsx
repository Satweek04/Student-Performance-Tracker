import React, { useEffect, useState } from 'react';
import { Search, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Mark, Student } from '../../types';

export default function StudentMarksPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // Added to hold assigned students with subjects
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(''); // Track selected student

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  // Fetch both assigned students and marks
const fetchData = async () => {
  if (!user) return;

  try {
    if (user.role === 'teacher') {
      const [studentsData, marksData] = await Promise.all([
        apiService.getAssignedStudents(),
        apiService.getMarksByTeacher(),
      ]);
      setStudents(studentsData);
      setMarks(marksData);
    } else if (user.role === 'student') {
      const marksData = await apiService.getStudentMarks();
      setMarks(marksData);
      setStudents([]);  // No students to select for a student role
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    setLoading(false);
  }
};


  // Derive list of subjects only for the selected student
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const availableSubjects = selectedStudent?.assignedSubjects || [];

  // Filter marks based on search and filters
  const filteredMarks = marks.filter(mark => {
    const matchesSearch = mark.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mark.examType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || mark.subject === selectedSubject;
    const matchesExamType = !selectedExamType || mark.examType === selectedExamType;
    return matchesSearch && matchesSubject && matchesExamType;
  });

  // Calculate unique subjects and exam types for filters (from marks)
  const uniqueSubjects = Array.from(new Set(marks.map(m => m.subject)));
  const uniqueExamTypes = Array.from(new Set(marks.map(m => m.examType)));

  // Calculate subject averages
  const subjectAverages = uniqueSubjects.map(subject => {
    const subjectMarks = marks.filter(m => m.subject === subject);
    const average = subjectMarks.reduce((sum, mark) => sum + (mark.marks / mark.totalMarks) * 100, 0) / subjectMarks.length;
    return { subject, average };
  });

  const overallAverage = marks.length > 0 
    ? marks.reduce((sum, mark) => sum + (mark.marks / mark.totalMarks) * 100, 0) / marks.length 
    : 0;

  const getGrade = (percentage: number) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
  };

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
          My Marks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your academic performance across all subjects
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Student Selector */}
        <select
          value={selectedStudentId}
          onChange={(e) => {
            setSelectedStudentId(e.target.value);
            setSelectedSubject(''); // Reset subject filter on student change
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.studentId})
            </option>
          ))}
        </select>

        {/* Subject Selector filtered by selected student*/}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={!selectedStudentId}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Subjects</option>
          {availableSubjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>

        {/* Exam Type */}
        <select
          value={selectedExamType}
          onChange={(e) => setSelectedExamType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Exam Types</option>
          {uniqueExamTypes.map((type) => (
            <option key={type} value={type} className="capitalize">{type}</option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by subject or exam type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>


      {/* Marks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exam Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMarks.map((mark) => {
                const percentage = (mark.marks / mark.totalMarks) * 100;
                const grade = getGrade(percentage);

                return (
                  <tr key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {mark.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {mark.marks}/{mark.totalMarks}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        grade.startsWith('A') 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : grade.startsWith('B')
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : grade.startsWith('C')
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                      {mark.examType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(mark.date).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMarks.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {searchTerm || selectedSubject || selectedExamType 
                ? 'Try adjusting your search filters.'
                : 'Marks will appear here once teachers add them.'
              }
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
