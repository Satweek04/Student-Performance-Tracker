import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Moon, Sun, LogOut, User, Menu, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-4 fixed top-0 right-0 left-0 lg:left-64 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user?.role === 'admin' && 'Admin Dashboard'}
            {user?.role === 'teacher' && 'Teacher Dashboard'}
            {user?.role === 'student' && 'Student Portal'}
          </h1>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            onClick={() => navigate('/chat')}
            title="Go to Chat"
          >
            <MessageCircle size={20} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="w-8 h-8 bg-[#0bf70d] rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
