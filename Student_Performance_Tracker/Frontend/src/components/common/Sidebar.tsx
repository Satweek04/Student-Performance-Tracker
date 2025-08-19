import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  UserPlus, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Calendar,
  GraduationCap,
  Award,
  TrendingUp
} from 'lucide-react';
import { useEffect } from 'react';

const adminMenuItems = [
  { icon: Home, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'All Students', path: '/admin/students' },
  { icon: UserPlus, label: 'All Teachers', path: '/admin/teachers' },
  { icon: BarChart3, label: 'About Us', path: '/AboutUS' },
];

const teacherMenuItems = [
  { icon: Home, label: 'Dashboard', path: '/teacher' },
  { icon: Users, label: 'My Students', path: '/teacher/students' },
  { icon: Award, label: 'Manage Marks', path: '/teacher/marks' },
  { icon: Calendar, label: 'Attendance', path: '/teacher/attendance' },
  { icon: BarChart3, label: 'About Us', path: '/AboutUS' },
];

const studentMenuItems = [
  { icon: Home, label: 'Dashboard', path: '/student' },
  { icon: Award, label: 'My Marks', path: '/student/marks' },
  { icon: Calendar, label: 'My Attendance', path: '/student/attendance' },
  { icon: TrendingUp, label: 'Performance', path: '/student/performance' },
  { icon: BarChart3, label: 'Analytics', path: '/AboutUS' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [location.pathname]);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'teacher':
        return teacherMenuItems;
      case 'student':
        return studentMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 w-64 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <GraduationCap size={32} className="text-[#0bf70d]" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            EduManage
          </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0bf70d] text-white shadow-lg transform scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}