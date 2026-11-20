import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, collegeDomain } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your college email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      addToast('Welcome back to Campusly!', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Login helper
  const handleDemoSignIn = async (demoRole = 'student') => {
    setLoading(true);
    try {
      const demoEmail = demoRole === 'admin' ? `admin@${collegeDomain}` : `alex.cs@${collegeDomain}`;
      await login(demoEmail, 'campuspass123');
      addToast(`Logged in as Demo ${demoRole === 'admin' ? 'Admin' : 'Student'}!`, 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      addToast('Failed to start demo session', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back to Campus
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with your verified college credentials
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121824] border border-[#232d42] shadow-2xl backdrop-blur-xl">
          
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* College Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder={`yourname@${collegeDomain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl glass-input"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); addToast('Password reset link will be sent to your college inbox.', 'info'); }} className="text-xs text-indigo-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl glass-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-[#151d2d] border-[#232d42] focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2.5 text-xs text-slate-400 cursor-pointer select-none">
                Remember my login on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Campus</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-6 border-t border-[#232d42]">
            <p className="text-xs text-center text-slate-400 font-medium mb-3">
              Testing locally? One-click demo login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('student')}
                disabled={loading}
                className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                disabled={loading}
                className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
            Register your college email
          </Link>
        </p>

      </div>
    </div>
  );
}
