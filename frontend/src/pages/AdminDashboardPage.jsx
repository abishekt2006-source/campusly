import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Sparkles,
  TrendingUp,
  Search,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activeSection, setActiveSection] = useState('overview'); // overview, users, reports
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  const isAdmin = profile?.role === 'admin';

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, rRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
      ]);
      setStats(sRes.data);
      setUsersList(uRes.data);
      setReportsList(rRes.data);
    } catch (err) {
      console.warn('Admin fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/action`, { action });
      addToast(`Action '${action}' applied to student account.`, 'success');
      setUsersList((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === 'verify') return { ...u, is_verified: true };
          if (action === 'ban') return { ...u, is_banned: true };
          if (action === 'unban') return { ...u, is_banned: false };
          return u;
        })
      );
    } catch (err) {
      addToast('Could not complete user action', 'error');
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await api.post(`/admin/reports/${reportId}/action`, { action });
      addToast(`Report marked as ${action === 'action_taken' ? 'Resolved & Deleted' : 'Dismissed'}.`, 'success');
      setReportsList((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      addToast('Could not resolve report', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-[#121824] border border-[#232d42] text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">College Administrator Area</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Access restricted. This panel is reserved exclusively for institution moderators and authorized staff.
        </p>
        <Link to="/" className="btn-primary py-2 px-4 text-xs inline-flex">
          Back to Campus Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#121824] border border-amber-500/30 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Campus Administration & Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Moderator Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Student verification, community governance, safety monitoring, and system metrics.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-[#121824] border border-[#232d42]">
            <p className="text-xs font-semibold text-slate-400">Total Students</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.total_students}</p>
            <span className="text-[10px] text-emerald-400 font-bold">100% Institutional</span>
          </div>
          <div className="p-5 rounded-3xl bg-[#121824] border border-[#232d42]">
            <p className="text-xs font-semibold text-slate-400">Feed Posts</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.total_posts}</p>
            <span className="text-[10px] text-indigo-400 font-bold">Campus Wide</span>
          </div>
          <div className="p-5 rounded-3xl bg-[#121824] border border-[#232d42]">
            <p className="text-xs font-semibold text-slate-400">Communities</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.total_communities}</p>
            <span className="text-[10px] text-purple-400 font-bold">Clubs & Depts</span>
          </div>
          <div className="p-5 rounded-3xl bg-[#121824] border border-rose-500/30 bg-rose-950/10">
            <p className="text-xs font-semibold text-rose-300">Pending Reports</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{reportsList.length}</p>
            <span className="text-[10px] text-rose-400 font-bold">Requires Action</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121824] border border-[#232d42]">
        {[
          { id: 'overview', label: 'Registered Students' },
          { id: 'reports', label: `Moderation Queue (${reportsList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Students Verification & Ban Management */}
      {activeSection === 'overview' && (
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white">Student Enrollment & Safety</h3>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name/email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232d42] text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">College Email</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232d42]/60">
                {usersList
                  .filter((u) => u.username?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-white truncate">{u.full_name}</p>
                            <p className="text-[10px] text-slate-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3 text-slate-300">{u.department || 'CS'} • Sem {u.semester || 1}</td>
                      <td className="py-3">
                        {u.is_banned ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Banned
                          </span>
                        ) : u.is_verified ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {!u.is_verified && (
                          <button
                            onClick={() => handleUserAction(u.id, 'verify')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {u.is_banned ? (
                          <button
                            onClick={() => handleUserAction(u.id, 'unban')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(u.id, 'ban')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white font-medium transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: Moderation Queue */}
      {activeSection === 'reports' && (
        <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Reported Content & Violations</span>
          </h3>

          {reportsList.length === 0 ? (
            <p className="text-xs text-center text-slate-500 py-6">
              No pending reports! Campus is clean and compliant.
            </p>
          ) : (
            <div className="space-y-3">
              {reportsList.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-[#151d2d] border border-[#232d42] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                        {rep.target_type}
                      </span>
                      <span className="text-slate-400">Flagged for:</span>
                      <strong className="text-white">{rep.reason}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      Target ID: {rep.target_id} • Status: {rep.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'action_taken')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-500 transition-colors"
                    >
                      Delete Content
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismiss')}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
