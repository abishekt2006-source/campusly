import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Users, 
  Hash, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Plus,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { addToast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ students: [], communities: [], posts: [], hashtags: [] });
  const [loading, setLoading] = useState(false);

  const performSearch = async (term, tabType) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(term)}&type=${tabType}`);
      setResults(res.data);
    } catch (err) {
      console.warn('Search query error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeTab);
    }
  }, [initialQuery, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim(), activeTab);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search students, #hashtags, clubs, or topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-2xl glass-input"
          autoFocus
        />
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121824] border border-[#232d42] overflow-x-auto">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'students', label: `Students (${results.students?.length || 0})` },
          { id: 'communities', label: `Communities (${results.communities?.length || 0})` },
          { id: 'hashtags', label: `Hashtags (${results.hashtags?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Container */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Students Results */}
          {(activeTab === 'all' || activeTab === 'students') && results.students?.length > 0 && (
            <div className="p-5 rounded-3xl bg-[#121824] border border-[#232d42] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Verified Students</span>
              </h3>
              <div className="divide-y divide-[#232d42]/60">
                {results.students.map((student) => (
                  <div key={student.id} className="py-3 flex items-center justify-between gap-3">
                    <Link to={`/profile/${student.username}`} className="flex items-center gap-3 min-w-0">
                      <img
                        src={student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`}
                        alt={student.username}
                        className="w-10 h-10 rounded-full object-cover border border-[#232d42]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate">
                            {student.full_name}
                          </p>
                          {student.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-indigo-400">@{student.username} • {student.department}</p>
                      </div>
                    </Link>

                    <Link
                      to={`/profile/${student.username}`}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities Results */}
          {(activeTab === 'all' || activeTab === 'communities') && results.communities?.length > 0 && (
            <div className="p-5 rounded-3xl bg-[#121824] border border-[#232d42] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Communities</span>
              </h3>
              <div className="divide-y divide-[#232d42]/60">
                {results.communities.map((comm) => (
                  <div key={comm.id} className="py-3 flex items-center justify-between gap-3">
                    <Link to={`/community/${comm.slug}`} className="flex items-center gap-3 min-w-0">
                      <img
                        src={comm.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${comm.slug}`}
                        alt={comm.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-[#232d42]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate">
                          {comm.name}
                        </p>
                        <p className="text-xs text-indigo-400 font-mono">
                          c/{comm.slug} • {comm.members_count} members
                        </p>
                      </div>
                    </Link>
                    <Link to={`/community/${comm.slug}`} className="btn-secondary py-1.5 px-3 text-xs">
                      Visit
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags Results */}
          {(activeTab === 'all' || activeTab === 'hashtags') && results.hashtags?.length > 0 && (
            <div className="p-5 rounded-3xl bg-[#121824] border border-[#232d42] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <span>Hashtags</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {results.hashtags.map((h) => (
                  <Link
                    key={h.id}
                    to={`/search?q=%23${h.tag}`}
                    className="p-3 rounded-xl bg-[#151d2d] border border-[#232d42] hover:border-indigo-500/40 text-xs flex items-center justify-between"
                  >
                    <span className="font-bold text-white">#{h.tag}</span>
                    <span className="text-[11px] text-slate-400">{h.post_count} posts</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty search */}
          {!loading && results.students?.length === 0 && results.communities?.length === 0 && results.hashtags?.length === 0 && (
            <div className="p-12 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
              <p className="text-sm font-bold text-white">No results found for "{query}"</p>
              <p className="text-xs text-slate-400">Try searching with a broader keyword, department, or student username.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
