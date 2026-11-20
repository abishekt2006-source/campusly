import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  Calendar, 
  AtSign, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register, collegeDomain } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    department: 'Computer Science',
    semester: '1',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication (ECE)',
    'Electrical & Instrumentation (ICE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology',
    'Information Technology',
    'Business Administration (BBA/MBA)',
    'Architecture & Design',
    'Applied Sciences & Humanities'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-suggest username if user types their email
      if (name === 'email' && !prev.username && value.includes('@')) {
        updated.username = value.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (collegeDomain && !formData.email.toLowerCase().endsWith(`@${collegeDomain.toLowerCase()}`)) {
      setErrorMsg(`Only verified college email addresses ending with @${collegeDomain} are allowed.`);
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim().toLowerCase(),
        department: formData.department,
        semester: formData.semester,
        password: formData.password,
      });

      addToast('Student account registered successfully! Welcome to Campusly.', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to complete registration.');
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-3">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Claim Your Student ID
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Join the verified exclusive network for your university
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121824] border border-[#232d42] shadow-2xl backdrop-blur-xl">
          
          {/* Domain alert banner */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-indigo-300 text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <span>
              Configured campus domain:{' '}
              <strong className="text-white font-mono">@{collegeDomain}</strong>. Only enrolled students can register.
            </span>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Alex Rivera"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    placeholder="e.g. alex_rivera"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* College Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Official College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder={`student@${collegeDomain}`}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input font-mono"
                  required
                />
              </div>
            </div>

            {/* Department & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-xl glass-input cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#121824] text-slate-100">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-xl glass-input cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                    <option key={sem} value={sem} className="bg-[#121824] text-slate-100">
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Code of Conduct agreement */}
            <div className="pt-2 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-400 leading-snug">
                By joining Campusly, you agree to treat batchmates respectfully and adhere to our campus community guidelines.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create My Verified Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already registered on Campusly?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
            Log in to your account
          </Link>
        </p>

      </div>
    </div>
  );
}
