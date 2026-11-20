import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowBigUp, ArrowBigDown, Reply, Send, CornerDownRight, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function CommentThread({ comments = [], postId, onCommentAdded }) {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostReply = async (parentId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: replyText.trim(),
        parent_id: parentId,
      });
      addToast('Reply posted!', 'success');
      setReplyText('');
      setReplyingTo(null);
      if (onCommentAdded) onCommentAdded(res.data);
    } catch (err) {
      console.error(err);
      addToast('Could not post reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment, isChild = false) => {
    return (
      <div key={comment.id} className={`flex gap-3 text-xs ${isChild ? 'ml-6 sm:ml-8 mt-3 border-l-2 border-[#232d42] pl-3' : 'mt-4'}`}>
        <img
          src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.username || 'user'}`}
          alt="Avatar"
          className="w-7 h-7 rounded-full object-cover border border-[#232d42] flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-[#151d2d] p-3 rounded-2xl border border-[#232d42]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white truncate">{comment.author?.full_name}</span>
                <span className="text-slate-500 font-mono">@{comment.author?.username}</span>
                {comment.author?.is_verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-500">just now</span>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-1.5 px-1 text-[11px] text-slate-400">
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>

          {/* Inline Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-2.5 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={`Replying to @${comment.author?.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input"
                autoFocus
              />
              <button
                onClick={() => handlePostReply(comment.id)}
                disabled={submitting || !replyText.trim()}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {comments.length === 0 ? (
        <p className="text-xs text-center text-slate-500 py-3">
          No comments yet. Start the campus conversation!
        </p>
      ) : (
        comments.map((c) => renderComment(c))
      )}
    </div>
  );
}
