import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image, 
  Video, 
  Flame, 
  Clock, 
  TrendingUp, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/feed/PostCard';
import StoriesCarousel from '../components/stories/StoriesCarousel';
import api from '../services/api';

export default function HomePage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('trending');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from backend
  const fetchFeed = async (category) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?category=${category}`);
      setPosts(res.data);
    } catch (err) {
      console.warn('Could not fetch posts feed from backend, keeping fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeTab);
  }, [activeTab]);

  const handleDeletePost = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SNAPCHAT STORIES CAROUSEL (Real & Interactive) */}
      <StoriesCarousel />

      {/* 2. CREATE POST QUICK TRIGGER */}
      <div className="p-4 rounded-3xl bg-[#121824] border border-[#232d42]">
        <div className="flex items-center gap-3">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-[#232d42]"
          />
          <Link
            to="/create-post"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#151d2d] border border-[#232d42] text-sm text-slate-400 hover:text-slate-200 hover:border-indigo-500/50 transition-all flex items-center justify-between"
          >
            <span>What's happening on campus today?</span>
            <Sparkles className="w-4 h-4 text-indigo-400 opacity-70" />
          </Link>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#232d42]/60 px-2 text-xs text-slate-400">
          <Link to="/create-post" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <Image className="w-4 h-4 text-emerald-400" />
            <span>Photo Carousel</span>
          </Link>
          <Link to="/create-post" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <Video className="w-4 h-4 text-purple-400" />
            <span>Video Clip</span>
          </Link>
          <Link to="/communities" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Select Club</span>
          </Link>
        </div>
      </div>

      {/* 3. FEED CATEGORY TABS (Reddit-Style) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 p-1.5 rounded-2xl bg-[#121824] border border-[#232d42]">
          {[
            { id: 'trending', label: 'Trending', icon: Flame },
            { id: 'latest', label: 'Latest', icon: Clock },
            { id: 'popular', label: 'Top Rated', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-[#1b2333]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => fetchFeed(activeTab)}
          className="p-2.5 rounded-2xl bg-[#121824] border border-[#232d42] text-slate-400 hover:text-white transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* 4. POST FEED LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-4 bg-slate-800 rounded" />
                  <div className="w-20 h-3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-full h-16 bg-slate-800 rounded-xl" />
              <div className="w-full h-64 bg-slate-800 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No posts in this feed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Be the first verified student to post about an event, notes, or campus questions!
          </p>
          <Link to="/create-post" className="btn-primary py-2 px-4 text-xs inline-flex">
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>
      )}

    </div>
  );
}
