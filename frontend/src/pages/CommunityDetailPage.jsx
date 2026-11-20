import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Check, 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  Calendar,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function CommunityDetailPage() {
  const { slug } = useParams();
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/communities/${slug}`);
      setCommunity(res.data);

      // Fetch posts for this community
      const pRes = await api.get(`/posts?community_id=${res.data.id}`);
      setPosts(pRes.data);
    } catch (err) {
      console.warn('Could not load community:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [slug]);

  const handleJoinToggle = async () => {
    if (!community) return;
    try {
      if (community.is_member) {
        await api.post(`/communities/${slug}/leave`);
        addToast(`Left c/${slug}`, 'info');
      } else {
        await api.post(`/communities/${slug}/join`);
        addToast(`Joined c/${slug}!`, 'success');
      }

      setCommunity((prev) => ({
        ...prev,
        is_member: !prev.is_member,
        members_count: prev.is_member ? prev.members_count - 1 : prev.members_count + 1,
      }));
    } catch (err) {
      addToast('Could not update membership', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-8 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-3">
        <p className="text-white font-bold">Community not found.</p>
        <Link to="/communities" className="btn-primary py-2 px-4 text-xs inline-flex">
          Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/communities')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Communities</span>
      </button>

      {/* Hero Banner Card */}
      <div className="rounded-3xl bg-[#121824] border border-[#232d42] overflow-hidden shadow-2xl">
        <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-900">
          <img
            src={community.cover_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200'}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent" />
        </div>

        <div className="p-6 pt-0 relative">
          <div className="-mt-14 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={community.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${community.slug}`}
                alt={community.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-[#121824] shadow-xl bg-[#121824]"
              />
              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {community.name}
                </h1>
                <p className="text-xs font-semibold text-indigo-400 font-mono">
                  c/{community.slug} • {community.members_count} verified students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleJoinToggle}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  community.is_member
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                    : 'btn-primary'
                }`}
              >
                {community.is_member ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Member</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join Circle</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  addToast('Community link copied!', 'info');
                }}
                className="p-2.5 rounded-xl bg-[#1b2333] border border-[#232d42] text-slate-300 hover:text-white"
                title="Share Community"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {community.description}
          </p>

          {/* Rules Accordion / Card */}
          {community.rules && (
            <div className="mt-5 p-4 rounded-2xl bg-[#151d2d]/80 border border-[#232d42] text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Community Guidelines & Rules:</span>
              </div>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                {community.rules}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Post to this Community Trigger */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[#121824] border border-[#232d42]">
        <div className="flex items-center gap-3">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border border-[#232d42]"
          />
          <div>
            <p className="text-xs font-semibold text-slate-300">
              Have something to share with <strong className="text-white">c/{community.slug}</strong>?
            </p>
            <p className="text-[11px] text-slate-500">Post announcements, doubts, or media</p>
          </div>
        </div>
        <Link
          to={`/create-post?community=${community.slug}`}
          className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Here</span>
        </Link>
      </div>

      {/* Community Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Community Discussions & Posts
        </h3>

        {posts.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
            <p className="text-sm font-bold text-white">No posts in c/{community.slug} yet</p>
            <p className="text-xs text-slate-400">Be the first student to publish a post in this circle!</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

    </div>
  );
}
