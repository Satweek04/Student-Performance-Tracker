import React, { useEffect, useState } from 'react';
import { Plus, Search, Award, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Student, Mark } from '../../types';
import { EXAM_TYPES } from '../../services/config';

export default function MarksPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    marks: '',
    totalMarks: '100',
    examType: 'quiz' as const,
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const teacher = user as any;

  // Find currently selected student from students list
const selectedStudent = students.find(s => s.studentId === formData.studentId);

// Use the assigned subjects of the selected student or empty array
const assignedSubjects = selectedStudent?.assignedSubjects || [];


  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
    console.log(teacher);
    
  }, [user]);

const fetchData = async () => {
  if (!user) return;

  try {
    if (user.role === 'teacher') {
      // Only teachers call teacher APIs
      const [studentsData, marksData] = await Promise.all([
        apiService.getAssignedStudents(),
        apiService.getMarksByTeacher(),
      ]);
      setStudents(studentsData);
      setMarks(marksData);
    } else if (user.role === 'student') {
      // Only students call student APIs
      const marksData = await apiService.getStudentMarks();
      setMarks(marksData);
      setStudents([]); // No students for students themselves
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    setLoading(false);
  }
};


const handleAddMark = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const newMark = await apiService.addMark({
      ...formData,
      marks: parseInt(formData.marks),
      totalMarks: parseInt(formData.totalMarks),
      teacherId: user!.teacherId,
    });

    const student = students.find(s => s.studentId === formData.studentId);
    const enrichedMark = { ...newMark, studentName: student?.name || 'Unknown Student' };

    setMarks([...marks, enrichedMark]);
    setShowAddModal(false);
    setFormData({
      studentId: '',
      subject: '',
      marks: '',
      totalMarks: '100',
      examType: 'quiz',
      date: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Failed to add mark:', error);
    alert('Failed to add mark. Please try again.');
  } finally {
    setSubmitting(false);
  }
};


  const filteredMarks = marks.filter(mark => {
    const student = students.find(s => s.id === mark.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mark.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || mark.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Marks Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add and manage marks for your students
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-[#0bf70d] text-white px-4 py-2 rounded-lg hover:bg-[#0ae60c] transition-colors"
        >
          <Plus size={20} />
          <span>Add Marks</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Subjects</option>
          {teacher?.subjects?.map((subject: string) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
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
                const student = students.find(s => s.id === mark.studentId);
                const percentage = (mark.marks / mark.totalMarks) * 100;
                const grade = getGrade(percentage);
                
                return (
                  <tr key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#0bf70d] rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-white">
                            {student?.name.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {mark?.studentName || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {student?.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
              No marks found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding marks for your students.
            </p>
          </div>
        )}
      </div>

      {/* Add Mark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Marks
            </h2>

            <form onSubmit={handleAddMark} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Student
                </label>
              <select
  value={formData.studentId}
  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
  required
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
>
  <option value="">Select a student</option>
  {students.map(student => (
    <option key={student.studentId} value={student.studentId}>
      {student.name} ({student.studentId})
    </option>
  ))}
</select>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a subject</option>
                  {assignedSubjects.length > 0 ? (
  assignedSubjects.map((subject: string) => (
    <option key={subject} value={subject}>{subject}</option>
  ))
) : (
  <option disabled>No subjects assigned to selected student</option>
)}

                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Marks Obtained
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                    placeholder="85"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Exam Type
                </label>
                <select
                  required
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                >
                  {EXAM_TYPES.map((type) => (
                    <option key={type} value={type} className="capitalize">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#0bf70d] text-white rounded-lg hover:bg-[#0ae60c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}