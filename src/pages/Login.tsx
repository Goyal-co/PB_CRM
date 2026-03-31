import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, Building2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RealEstate CRM</h1>
          <p className="text-gray-500 text-sm mt-1">Post-Booking Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Access — Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('admin@gmail.com', 'admin1234')}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl text-left transition-colors"
              >
                <p className="text-xs font-bold text-blue-700">Admin</p>
                <p className="text-xs text-blue-500 mt-0.5 font-mono">admin@gmail.com</p>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('user@gmail.com', 'user1234')}
                className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl text-left transition-colors"
              >
                <p className="text-xs font-bold text-purple-700">User</p>
                <p className="text-xs text-purple-500 mt-0.5 font-mono">user@gmail.com</p>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('manager@gmail.com', 'manager1234')}
                className="p-3 bg-green-50 hover:bg-green-100 border border-green-100 rounded-xl text-left transition-colors col-span-2"
              >
                <p className="text-xs font-bold text-green-700">Manager</p>
                <p className="text-xs text-green-500 mt-0.5 font-mono">manager@gmail.com</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 RealEstate CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
