import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  ShieldCheck, 
  Trash2, 
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CommentThread from './CommentThread';
import api from '../../services/api';

export default function PostCard({ post, onDelete }) {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [userVoted, setUserVoted] = useState(post.user_voted || 0);
  const [upvotes, setUpvotes] = useState(post.upvote_count || 0);
  const [downvotes, setDownvotes] = useState(post.downvote_count || 0);
  const [userLiked, setUserLiked] = useState(post.user_liked || false);
  const [likes, setLikes] = useState(post.like_count || 0);
  const [userBookmarked, setUserBookmarked] = useState(post.user_bookmarked || false);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const isAuthor = user && (user.id === post.author?.id || profile?.username === post.author?.username);
  const isAdmin = profile?.role === 'admin';

  // Reddit Upvote/Downvote
  const handleVote = async (direction) => {
    const newVote = userVoted === direction ? 0 : direction;
    let newUp = upvotes;
    let newDown = downvotes;

    if (userVoted === 1) newUp = Math.max(0, newUp - 1);
    if (userVoted === -1) newDown = Math.max(0, newDown - 1);

    if (newVote === 1) newUp += 1;
    if (newVote === -1) newDown += 1;

    // Optimistic UI update
    setUserVoted(newVote);
    setUpvotes(newUp);
    setDownvotes(newDown);

    try {
      await api.post(`/posts/${post.id}/vote`, { vote_type: newVote });
    } catch (err) {
      console.warn('Backend vote sync error:', err.message);
    }
  };

  // Instagram Heart Like
  const handleLike = async () => {
    const willLike = !userLiked;
    setUserLiked(willLike);
    setLikes(willLike ? likes + 1 : Math.max(0, likes - 1));

    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (err) {
      console.warn('Backend like sync error:', err.message);
    }
  };

  // Bookmark Toggle
  const handleBookmark = async () => {
    const willBookmark = !userBookmarked;
    setUserBookmarked(willBookmark);
    addToast(willBookmark ? 'Post saved to your bookmarks!' : 'Post removed from bookmarks', 'info');

    try {
      await api.post(`/posts/${post.id}/bookmark`);
    } catch (err) {
      console.warn('Backend bookmark sync error:', err.message);
    }
  };

  // Toggle comments
  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.get(`/posts/${post.id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.warn('Could not fetch comments:', err.message);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post.id}/comments`, {
        content: newCommentText.trim(),
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentCount((prev) => prev + 1);
      setNewCommentText('');
      addToast('Comment published!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this campus post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      addToast('Post deleted successfully.', 'success');
      if (onDelete) onDelete(post.id);
    } catch (err) {
      console.error(err);
      addToast('Could not delete post', 'error');
    }
  };

  const voteScore = upvotes - downvotes;

  return (
    <article className="rounded-3xl bg-[#121824] border border-[#232d42] overflow-hidden shadow-xl hover:border-indigo-500/30 transition-all duration-300">
      
      {/* 1. Post Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/profile/${post.author?.username}`}>
            <img
              src={post.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.username || 'user'}`}
              alt={post.author?.username}
              className="w-11 h-11 rounded-full object-cover border border-indigo-500/40 hover:scale-105 transition-transform"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author?.username}`}
                className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate"
              >
                {post.author?.full_name}
              </Link>
              {post.author?.is_verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Verified Student" />
              )}
              {post.community && (
                <>
                  <span className="text-xs text-slate-500">•</span>
                  <Link
                    to={`/community/${post.community.slug}`}
                    className="text-xs font-semibold text-indigo-400 hover:underline truncate"
                  >
                    c/{post.community.slug}
                  </Link>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {post.author?.department} • Sem {post.author?.semester}
            </p>
          </div>
        </div>

        {/* Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1b2333] transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div 
              className="absolute right-0 mt-1 w-44 rounded-2xl bg-[#151d2d] border border-[#232d42] shadow-2xl py-1.5 z-20 animate-fade-in"
              onMouseLeave={() => setMenuOpen(false)}
            >
              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => { setMenuOpen(false); handleDeletePost(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  addToast('Report submitted to college moderators.', 'info');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <span>Report Content</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Post Content */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Clickable Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=%23${tag}`}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Media Carousel */}
      {post.media && post.media.length > 0 && (
        <div className="relative bg-black/50 overflow-hidden border-y border-[#232d42]">
          {post.media[activeMediaIndex].media_type === 'video' ? (
            <video
              src={post.media[activeMediaIndex].media_url}
              controls
              className="w-full max-h-[500px] object-contain mx-auto"
            />
          ) : (
            <img
              src={post.media[activeMediaIndex].media_url}
              alt="Campus media"
              className="w-full max-h-[500px] object-contain mx-auto transition-transform duration-300"
            />
          )}

          {/* Carousel Arrows if multiple */}
          {post.media.length > 1 && (
            <>
              <button
                onClick={() => setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : post.media.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveMediaIndex((prev) => (prev < post.media.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {post.media.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeMediaIndex ? 'bg-white w-4' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Action Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Reddit Upvote / Downvote Pill */}
          <div className="flex items-center rounded-full bg-[#151d2d] border border-[#232d42] p-1">
            <button
              onClick={() => handleVote(1)}
              className={`p-1.5 rounded-full transition-colors ${
                userVoted === 1 ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-indigo-400'
              }`}
              title="Upvote"
            >
              <ArrowBigUp className="w-5 h-5 fill-current" />
            </button>
            <span className={`px-2 font-bold text-xs sm:text-sm ${
              userVoted === 1 ? 'text-indigo-400' : userVoted === -1 ? 'text-rose-400' : 'text-slate-200'
            }`}>
              {voteScore}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={`p-1.5 rounded-full transition-colors ${
                userVoted === -1 ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400 hover:text-rose-400'
              }`}
              title="Downvote"
            >
              <ArrowBigDown className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Instagram Heart Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              userLiked
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 font-semibold'
                : 'border-[#232d42] bg-[#151d2d] text-slate-400 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likes}</span>
          </button>

          {/* Comment Accordion Trigger */}
          <button
            onClick={toggleComments}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
              showComments
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                : 'border-[#232d42] bg-[#151d2d] text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentCount}</span>
          </button>

        </div>

        {/* Share & Bookmark */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full border transition-colors ${
              userBookmarked
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                : 'border-[#232d42] bg-[#151d2d] text-slate-400 hover:text-indigo-400'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${userBookmarked ? 'fill-indigo-500' : ''}`} />
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.origin + `/post/${post.id}`);
              addToast('Post link copied to clipboard!', 'info');
            }}
            className="p-2 rounded-full border border-[#232d42] bg-[#151d2d] text-slate-400 hover:text-slate-200 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Collapsible Comments Section */}
      {showComments && (
        <div className="p-4 sm:p-5 border-t border-[#232d42] bg-[#0d121c]/70 space-y-4 animate-fade-in">
          
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2.5">
            <input
              type="text"
              placeholder="Join the discussion... (press enter to post)"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl glass-input"
            />
            <button
              type="submit"
              disabled={submittingComment || !newCommentText.trim()}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>

          {/* Comment List */}
          {loadingComments ? (
            <div className="py-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <CommentThread
              comments={comments}
              postId={post.id}
              onCommentAdded={(newReply) => {
                setCommentCount((c) => c + 1);
              }}
            />
          )}

        </div>
      )}

    </article>
  );
}
