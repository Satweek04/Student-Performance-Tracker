import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const [mode, setMode] = useState<'password' | 'otp'>('password');

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));

  // local UI loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const navigate = useNavigate();
  const { login, loginWithOtp, sendOtp } = useAuth();

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoggingIn(true);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if(err instanceof Error){
        setError(err.message || 'Login Failed');
      } else{
        setError('Login Failed');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      await sendOtp(email);
      setOtpModalOpen(true); // stays true because component isn't unmounted now
    } catch (err: unknown) {
      if(err instanceof Error){
        setError(err.message || 'Failed to send OTP');
      } else{
        setError('Failed to send OTP');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otpValues];
      newOtp[index] = value;
      setOtpValues(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setVerifyingOtp(true);
    try {
      await loginWithOtp({ email, otp });
      setOtpModalOpen(false); // close modal after successful login
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if(err instanceof Error){
        setError(err.message || 'OTP Verification Failed');
      } else{
        setError('OTP Verification Failed');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <GraduationCap size={64} className="mx-auto text-[#0bf70d]" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to EduManage
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access your school management portal
          </p>
        </div>

        {/* Mode Switch */}
        <div className="flex border-b border-gray-300 dark:border-gray-700">
          <button
            type="button"
            className={`flex-1 py-2 text-center ${
              mode === 'password'
                ? 'border-b-2 border-[#0bf70d] text-[#0bf70d]'
                : 'text-gray-500'
            }`}
            onClick={() => setMode('password')}
          >
            Password Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center ${
              mode === 'otp'
                ? 'border-b-2 border-[#0bf70d] text-[#0bf70d]'
                : 'text-gray-500'
            }`}
            onClick={() => setMode('otp')}
          >
            OTP Login
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Password Login */}
        {mode === 'password' && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2 px-4 bg-[#0bf70d] text-white rounded-md disabled:opacity-50"
            >
              {loggingIn ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* OTP Login */}
        {mode === 'otp' && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full py-2 px-4 bg-[#0bf70d] text-white rounded-md disabled:opacity-50"
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP to Email'}
            </button>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don’t have a student account?{' '}
            <Link to="/register" className="text-[#0bf70d] font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Enter OTP
            </h3>
            <div className="flex justify-between mb-4">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  value={val}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 text-center border border-gray-400 dark:border-gray-600 rounded text-lg dark:bg-gray-800 dark:text-white"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="flex-1 py-2 px-4 bg-[#0bf70d] text-white rounded-md disabled:opacity-50"
              >
                {verifyingOtp ? 'Verifying...' : 'Submit OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
