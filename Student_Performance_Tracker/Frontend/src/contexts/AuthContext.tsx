import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../services/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
    loginWithOtp: (params: { email: string; otp: string }) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

const extractErrorMessage = (error: any, defaultMsg: string) => {
  let message = defaultMsg;

  // ✅ Handle fetch-based errors where error.data exists (from handleResponse in apiService)
  if (error?.data) {
    message = error.data.message || error.data.error || message;
  } 
  // ✅ Handle axios-style errors
  else if (error?.response?.data) {
    message = error.response.data.message || error.response.data.error || message;
  } 
  // ✅ Fallback to Error.message
  else if (error?.message) {
    message = error.message;
  }

  return message;
};


const login = async (credentials: LoginRequest) => {
  try {
    const response = await apiService.login(credentials);
    let loggedInUser = response.user;
    if (loggedInUser.role === 'teacher') {
      const teacherProfile = await apiService.getTeacherProfile();
      loggedInUser = { ...loggedInUser, ...teacherProfile };
    }
    setUser(loggedInUser);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Login failed'));
  }
};

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await apiService.register(data);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(extractErrorMessage(error, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

// OTP Service *********************************************************
// inside AuthProvider

// OTP Service
async function sendOtp(email: string) {
  try {
    // ❌ removed setLoading(true) so Layout doesn't block & unmount LoginForm
    await apiService.sendOtp({ email });
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Failed to send OTP'));
  }
}

async function loginWithOtp({ email, otp }: { email: string; otp: string }) {
  try {
    setLoading(true); // show global auth loading state during OTP login
    const response = await apiService.loginWithOtp({ email, otp });

    let loggedInUser = response.user;
    if (loggedInUser.role === 'teacher') {
      const teacherProfile = await apiService.getTeacherProfile();
      loggedInUser = { ...loggedInUser, ...teacherProfile };
    }

    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'OTP login failed'));
  } finally {
    setLoading(false); // ✅ make sure to reset loading
  }
}




// *********************************************************************

  const isAuthenticated = !!user;
  const hasRole = (role: string) => user?.role === role;





  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    loginWithOtp,
    sendOtp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
