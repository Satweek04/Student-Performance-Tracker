import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Student, Attendance } from '../../types';
import { ATTENDANCE_STATUS } from '../../services/config';

type AttendanceStatus = typeof ATTENDANCE_STATUS[number];
type AttendanceStateMap = Record<string, AttendanceStatus>;

export default function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceStates, setAttendanceStates] = useState<AttendanceStateMap>({});
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalSubject, setModalSubject] = useState('');
  const [modalGrade, setModalGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const teacher = user as any;

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (students.length > 0) {
      const initialStates: AttendanceStateMap = {};
      students.forEach(student => {
        initialStates[student.studentId] = 'present';
      });
      setAttendanceStates(initialStates);
    }
  }, [students]);

  const fetchData = async () => {
    try {
      const [studentsData, attendanceData] = await Promise.all([
        apiService.getAssignedStudents(),
        apiService.getAttendanceByTeacher(),
      ]);
      setStudents(studentsData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceStates((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Unique subjects only from students actually assigned (all grades)
  const assignedSubjectsList = Array.from(
    new Set(students.flatMap(s => s.assignedSubjects || []))
  );

  // List of unique grades from assigned students
  const gradesList = Array.from(new Set(students.map(s => s.grade))).sort();

  // Subjects assigned to students of the selected grade
  const gradeSubjectsList = modalGrade
    ? Array.from(
        new Set(
          students
            .filter(s => s.grade === modalGrade)
            .flatMap(s => s.assignedSubjects || [])
        )
      )
    : [];

  const handleAddBatchAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (modalDate < todayStr) {
      setError('Cannot mark attendance for a past date.');
      setSubmitting(false);
      return;
    }
    if (!modalGrade) {
      setError('Please select a grade.');
      setSubmitting(false);
      return;
    }
    if (!modalSubject) {
      setError('Please select a subject.');
      setSubmitting(false);
      return;
    }

    try {
      const filteredStudents = students.filter(s => s.grade === modalGrade);

      const records = filteredStudents.map((student) => ({
        studentId: student.studentId,
        subject: modalSubject,
        date: modalDate,
        status: attendanceStates[student.studentId],
        teacherId: teacher.teacherId,
      }));

      const resp = await apiService.addBatchAttendance(records);

      if ((resp as any).error) {
        setError((resp as any).error);
      } else {
        await fetchData();
        setShowAddModal(false);
        setModalDate(new Date().toISOString().split('T')[0]);
        setModalSubject('');
        setModalGrade('');
      }
    } catch (err: any) {
      if (err.status === 409) {
        setError('Attendance already marked for the given subject and students.');
      } else {
        setError('Failed to mark attendance. ' + (err?.message || 'Please try again.'));
      }
      console.error('Failed to mark batch attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAttendance = attendance.filter(att => {
    const student = students.find(s => s.studentId === att.studentId);
    const matchesSearch =
      !searchTerm ||
      (student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || att.subject === selectedSubject;
    const matchesDate = !selectedDate || att.date === selectedDate;
    return matchesSearch && matchesSubject && matchesDate;
  });

  const uniqueDates = Array.from(new Set(attendance.map(a => a.date))).sort().reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0bf70d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage student attendance for your subjects
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setError('');
            setModalDate(new Date().toISOString().split('T')[0]);
            setModalSubject('');
            setModalGrade('');
          }}
          className="flex items-center space-x-2 bg-[#0bf70d] text-white px-4 py-2 rounded-lg hover:bg-[#0ae60c] transition-colors"
        >
          <Plus size={20} />
          <span>Mark Batch Attendance</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name or subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Subjects</option>
          {teacher?.subjects?.map((subject: string) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <select
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Dates</option>
          {uniqueDates.map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 dark:text-white text-left">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(att => {
                const student = students.find(s => s.studentId === att.studentId);
                return (
                  <tr
                    key={att.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    {/* Student Name */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student?.name || 'Unknown'} ({student?.studentId})
                    </td>
                    {/* Subject */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {att.subject}
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          att.status === 'present'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : att.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Attendance (
              {`${new Date().toISOString().split('T')[0]}, ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`})
            </h2>
            <form onSubmit={handleAddBatchAttendance} className="space-y-4">
              {/* Grade Selector */}
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Grade</label>
                <select
                  required
                  value={modalGrade}
                  onChange={(e) => {
                    setModalGrade(e.target.value);
                    setModalSubject(''); // Reset subject when grade changes
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select grade</option>
                  {gradesList.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selector (filtered by grade) */}
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select
                  required
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!modalGrade}
                >
                  <option value="">Select subject</option>
                  {gradeSubjectsList.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Students List - Filtered by Grade */}
              <div>
                <label className="block text-sm font-medium mb-1">Mark Attendance</label>
                <div className="max-h-60 overflow-y-auto border p-2 rounded bg-white dark:bg-gray-700">
                  {students.filter(s => s.grade === modalGrade).map((student) => (
                    <div className="flex mb-2" key={student.studentId}>
                      <span className="mr-2">{student.name} ({student.studentId})</span>
                      <select
                        value={attendanceStates[student.studentId]}
                        onChange={(e) =>
                          handleAttendanceChange(student.studentId, e.target.value as AttendanceStatus)
                        }
                        className="border rounded-lg px-2 py-1"
                      >
                        {ATTENDANCE_STATUS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="text-red-500">{error}</div>}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setModalSubject('');
                    setModalGrade('');
                    setModalDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#0bf70d] text-white rounded-lg hover:bg-[#0ae60c]"
                >
                  {submitting ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
