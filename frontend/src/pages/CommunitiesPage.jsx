import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Flame, 
  Sparkles, 
  Check, 
  ArrowRight, 
  X,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CommunitiesPage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New community form
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    rules: '',
    avatar_url: '',
    cover_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communities');
      setCommunities(res.data);
    } catch (err) {
      console.warn('Could not fetch communities:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoinToggle = async (slug, isMember) => {
    try {
      if (isMember) {
        await api.post(`/communities/${slug}/leave`);
        addToast(`Left c/${slug}`, 'info');
      } else {
        await api.post(`/communities/${slug}/join`);
        addToast(`Joined c/${slug}! Welcome to the circle.`, 'success');
      }

      setCommunities((prev) =>
        prev.map((c) => {
          if (c.slug !== slug) return c;
          const willBeMember = !isMember;
          return {
            ...c,
            is_member: willBeMember,
            members_count: willBeMember ? c.members_count + 1 : Math.max(0, c.members_count - 1),
          };
        })
      );
    } catch (err) {
      console.error(err);
      addToast('Could not update membership', 'error');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim() || !formData.description.trim()) {
      addToast('Please complete all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/communities', {
        ...formData,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      });
      addToast(`Community c/${res.data.slug} created! You are the moderator.`, 'success');
      setCreateModalOpen(false);
      setFormData({ name: '', slug: '', description: '', rules: '', avatar_url: '', cover_url: '' });
      fetchCommunities();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || 'Failed to create community', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-[#121824] border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Campus Communities Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Find Your Campus Tribe
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            Join department circles, technical clubs, fest teams, or humor boards with Reddit-style community discussions.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary py-3 px-5 text-xs sm:text-sm flex items-center gap-2 flex-shrink-0 shadow-glow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search communities by name or slug (e.g. cs-dept, shutterbugs)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl glass-input"
        />
      </div>

      {/* Community Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] animate-pulse h-48" />
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-3">
          <p className="text-base font-bold text-white">No communities match "{searchQuery}"</p>
          <p className="text-xs text-slate-400">Why not create the first one for your club or batch?</p>
          <button onClick={() => setCreateModalOpen(true)} className="btn-primary py-2 px-4 text-xs">
            Create This Community
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCommunities.map((comm) => (
            <div
              key={comm.id}
              className="rounded-3xl bg-[#121824] border border-[#232d42] hover:border-indigo-500/40 overflow-hidden transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Cover Banner */}
              <div className="h-28 overflow-hidden relative bg-slate-900">
                <img
                  src={comm.cover_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600'}
                  alt={comm.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent" />
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                  {comm.members_count} members
                </span>
              </div>

              {/* Body */}
              <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  {/* Avatar overlapping banner */}
                  <div className="-mt-7 mb-3 flex items-end justify-between">
                    <img
                      src={comm.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${comm.slug}`}
                      alt={comm.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#121824] shadow-md bg-[#121824]"
                    />
                  </div>

                  <Link to={`/community/${comm.slug}`}>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {comm.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-semibold text-indigo-400 mt-0.5 font-mono">
                    c/{comm.slug}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-[#232d42] flex items-center justify-between gap-3">
                  <Link
                    to={`/community/${comm.slug}`}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>View Circle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleJoinToggle(comm.slug, comm.is_member)}
                    className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      comm.is_member
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                        : 'btn-primary'
                    }`}
                  >
                    {comm.is_member ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#121824] border border-[#232d42] shadow-2xl p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#232d42]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create Sub-Campus Community</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Community Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI & Robotics Society"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: !formData.slug ? e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') : formData.slug,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Community URL / Slug (c/...)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-indigo-400 font-mono">c/</span>
                  <input
                    type="text"
                    placeholder="robotics-society"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm rounded-xl glass-input font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this community about? Share mission, goals, or meeting times..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl glass-input resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Community Rules (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="1. Respect batchmates&#10;2. Keep discussions academic..."
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl glass-input resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#232d42]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Launch Community</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
