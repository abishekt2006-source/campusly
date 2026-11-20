import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Calendar, 
  Grid, 
  Bookmark, 
  Edit3, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  X,
  Save,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function ProfilePage() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const { user, profile: authProfile, setProfile: setAuthProfile } = useAuth();
  const { addToast } = useToast();

  const activeTabParam = searchParams.get('tab') || 'posts';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const [student, setStudent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    department: '',
    semester: 1,
    avatar_url: '',
    cover_url: '',
  });

  const targetUsername = username || authProfile?.username || 'student';
  const isMe = !username || (authProfile && username.toLowerCase() === authProfile.username.toLowerCase());

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${targetUsername}`);
      setStudent(res.data);
      setEditForm({
        full_name: res.data.full_name || '',
        bio: res.data.bio || '',
        department: res.data.department || '',
        semester: res.data.semester || 1,
        avatar_url: res.data.avatar_url || '',
        cover_url: res.data.cover_url || '',
      });

      // Fetch student posts
      const pRes = await api.get(`/users/${targetUsername}/posts`);
      setPosts(pRes.data);

      // If own profile, fetch saved posts
      if (isMe) {
        const bRes = await api.get('/users/me/bookmarks');
        setSavedPosts(bRes.data);
      }
    } catch (err) {
      console.warn('Could not load profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [targetUsername]);

  const handleFollowToggle = async () => {
    if (!student) return;
    try {
      const res = await api.post(`/users/${student.username}/follow`);
      const isNowFollowing = res.data.status === 'following';
      addToast(isNowFollowing ? `Following @${student.username}` : `Unfollowed @${student.username}`, 'info');

      setStudent((prev) => ({
        ...prev,
        is_following: isNowFollowing,
        followers_count: isNowFollowing ? prev.followers_count + 1 : Math.max(0, prev.followers_count - 1),
      }));
    } catch (err) {
      addToast('Could not update follow status', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/users/me', editForm);
      setStudent((prev) => ({ ...prev, ...res.data }));
      if (setAuthProfile) setAuthProfile((prev) => ({ ...prev, ...res.data }));
      addToast('Profile updated successfully!', 'success');
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Could not update profile', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-3">
        <p className="text-white font-bold">Student not found.</p>
        <Link to="/" className="btn-primary py-2 px-4 text-xs inline-flex">
          Back to Campus Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-[#121824] border border-[#232d42] overflow-hidden shadow-2xl">
        {/* Cover Photo */}
        <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-900">
          <img
            src={student.cover_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200'}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent" />
        </div>

        <div className="p-6 pt-0 relative">
          {/* Avatar & Action Button */}
          <div className="-mt-14 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`}
                alt={student.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-[#121824] shadow-xl bg-[#121824]"
              />
              <div className="mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {student.full_name}
                  </h1>
                  {student.is_verified && (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" title="Verified College Student" />
                  )}
                </div>
                <p className="text-xs font-semibold text-indigo-400 font-mono">
                  @{student.username}
                </p>
              </div>
            </div>

            {/* Profile Action */}
            <div>
              {isMe ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    student.is_following
                      ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/20 hover:text-rose-300'
                      : 'btn-primary'
                  }`}
                >
                  {student.is_following ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Department & Bio */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{student.department} • Semester {student.semester}</span>
            </div>

            {student.bio ? (
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {student.bio}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic">No bio written yet.</p>
            )}

            {/* Counters */}
            <div className="flex items-center gap-6 pt-3 border-t border-[#232d42] text-xs">
              <div>
                <strong className="text-white text-sm font-extrabold">{student.posts_count || posts.length}</strong>
                <span className="text-slate-400 ml-1">Posts</span>
              </div>
              <div>
                <strong className="text-white text-sm font-extrabold">{student.followers_count || 0}</strong>
                <span className="text-slate-400 ml-1">Followers</span>
              </div>
              <div>
                <strong className="text-white text-sm font-extrabold">{student.following_count || 0}</strong>
                <span className="text-slate-400 ml-1">Following</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121824] border border-[#232d42]">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'posts'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({posts.length})</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Posts ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
              <p className="text-sm font-bold text-white">No posts shared yet</p>
              <p className="text-xs text-slate-400">Posts published by @{student.username} will appear here.</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'saved' && isMe && (
          savedPosts.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-2">
              <Bookmark className="w-6 h-6 text-indigo-400 mx-auto" />
              <p className="text-sm font-bold text-white">No saved posts yet</p>
              <p className="text-xs text-slate-400">Click the bookmark icon on any post to save it for later review.</p>
            </div>
          ) : (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#121824] border border-[#232d42] shadow-2xl p-6 sm:p-8 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#232d42]">
              <h3 className="text-base font-bold text-white">Edit Student Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Bio / Status
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl glass-input resize-none"
                  placeholder="Share your interests, club leads, or hobbies..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl glass-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editForm.cover_url}
                  onChange={(e) => setEditForm({ ...editForm, cover_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl glass-input font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#232d42]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
