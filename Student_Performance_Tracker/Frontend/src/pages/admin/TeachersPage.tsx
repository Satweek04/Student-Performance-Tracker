import React, { useEffect, useState } from 'react';
import { Plus, Search, Mail, BookOpen } from 'lucide-react';
import { apiService } from '../../services/api';
import { Teacher } from '../../types';
import { SUBJECTS } from '../../services/config';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subjects: [] as string[],
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await apiService.getAllTeachers();
      setTeachers(response.teachers || response.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newTeacher = await apiService.addTeacher(formData);
      setTeachers([...teachers, newTeacher]);
      setShowAddModal(false);
      setFormData({ name: '', email: '', subjects: [], password: '' });
    } catch (error) {
      console.error('Failed to add teacher:', error);
      alert('Failed to add teacher. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  // Defensive filtering with nullish checks and defaults
  const filteredTeachers = teachers.filter(teacher => {
    const name = teacher.name ?? '';
    const email = teacher.email ?? '';
    const subjects = teacher.subjects ?? [];
    const term = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      subjects.some(subject => subject.toLowerCase().includes(term))
    );
  });

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
            Teachers Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all teachers in the system
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-[#0bf70d] text-white px-4 py-2 rounded-lg hover:bg-[#0ae60c] transition-colors"
        >
          <Plus size={20} />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search teachers by name, email, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#0bf70d] rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {teacher.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {teacher.name || 'No Name'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {teacher.teacherId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={16} />
                <span>{teacher.email || 'N/A'}</span>
              </div>

              <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
  <BookOpen size={16} className="mt-0.5" />
  <div>
    <p className="font-medium">Subjects:</p>
    <div className="flex flex-wrap gap-1 mt-1">
      {(teacher.subjects ?? []).map((subject) => (
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


              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Students:</span> {teacher.assignedStudents?.length ?? 0}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No teachers found matching your search.
          </p>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Teacher
            </h2>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                  placeholder="Enter teacher's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#0bf70d] focus:border-[#0bf70d] dark:bg-gray-700 dark:text-white"
                  placeholder="Enter teacher's email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjects (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {SUBJECTS.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="text-[#0bf70d] focus:ring-[#0bf70d]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {subject}
                      </span>
                    </label>
                  ))}
                </div>
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
                  disabled={submitting || formData.subjects.length === 0}
                  className="flex-1 px-4 py-2 bg-[#0bf70d] text-white rounded-lg hover:bg-[#0ae60c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
