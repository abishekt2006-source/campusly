import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Image, 
  Video, 
  Sparkles, 
  X, 
  UploadCloud, 
  Send, 
  ArrowLeft, 
  Flame, 
  Hash, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CreatePostPage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const communities = [
    { id: 'cs-dept', name: 'Computer Science Dept', slug: 'cs-dept' },
    { id: 'coding-club', name: 'Coding & Hackathons', slug: 'coding-club' },
    { id: 'shutterbugs', name: 'Campus Photography Club', slug: 'shutterbugs' },
    { id: 'campus-memes', name: 'Campus Memes & Banter', slug: 'campus-memes' },
    { id: 'college-fests', name: 'Campus Events & Fest Hub', slug: 'college-fests' },
    { id: 'campus-confessions', name: 'Anonymous Confessions', slug: 'campus-confessions' },
  ];

  const suggestedTags = ['TechFest2026', 'Hackathon', 'CampusLife', 'ExamWeek', 'CanteenVibes'];

  const handleAddTag = (tag) => {
    if (!content.includes(`#${tag}`)) {
      setContent((prev) => `${prev.trim()} #${tag} `);
    }
  };

  // Upload file to backend storage
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/posts/upload-media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setMediaList((prev) => [
          ...prev,
          {
            media_url: res.data.url,
            media_type: res.data.media_type,
            aspect_ratio: '16:9',
          },
        ]);
        addToast(`Uploaded ${file.name}`, 'success');
      } catch (err) {
        console.error(err);
        addToast(`Failed to upload ${file.name}`, 'error');
      }
    }
    setUploading(false);
  };

  const handleRemoveMedia = (index) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaList.length === 0) {
      addToast('Please enter post text or attach a photo/video.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/posts', {
        content: content.trim(),
        community_id: selectedCommunity || null,
        media: mediaList,
      });

      addToast('Post published to campus feed!', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || 'Failed to publish post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Create Campus Post
        </span>
      </div>

      {/* Main Studio Card */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#121824] border border-[#232d42] shadow-2xl space-y-6">
        
        {/* Author & Community Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232d42]">
          <div className="flex items-center gap-3">
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
            />
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{profile?.full_name || 'Verified Student'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </p>
              <p className="text-xs text-slate-400">
                Posting as <strong className="text-indigo-400 font-mono">@{profile?.username || 'student'}</strong>
              </p>
            </div>
          </div>

          {/* Select Community */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input cursor-pointer"
            >
              <option value="" className="bg-[#121824] text-slate-400">
                🌐 General Campus Feed
              </option>
              {communities.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121824] text-slate-200">
                  c/{c.slug} ({c.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Post Textarea */}
        <div className="relative">
          <textarea
            rows={5}
            placeholder="Share event highlights, questions, project updates, or thoughts with campus..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-2xl glass-input text-sm sm:text-base resize-none leading-relaxed"
            maxLength={5000}
          />
          <div className="absolute bottom-3 right-3 text-[11px] text-slate-500">
            {content.length}/5000
          </div>
        </div>

        {/* Hashtags Suggestion Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
            <span>Suggested Campus Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#151d2d] border border-[#232d42] hover:border-indigo-500/50 text-slate-300 hover:text-indigo-400 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Media Preview Grid */}
        {mediaList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mediaList.map((med, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden group aspect-video bg-black/60 border border-[#232d42]">
                {med.media_type === 'video' ? (
                  <video src={med.media_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={med.media_url} alt="Upload preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Media Upload Dropzone */}
        <div className="p-4 rounded-2xl bg-[#151d2d]/60 border border-dashed border-[#232d42] hover:border-indigo-500/50 transition-colors text-center relative">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="w-7 h-7 text-indigo-400 animate-bounce" />
            <p className="text-xs text-slate-300 font-medium">
              Click or drag photos / short videos to attach
            </p>
            <p className="text-[10px] text-slate-500">
              Supports JPG, PNG, WEBP (up to 10MB) & MP4 clips (up to 50MB)
            </p>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[#232d42]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary py-2.5 px-4 text-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="btn-primary py-3 px-6 text-sm flex items-center gap-2 shadow-glow-sm"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Publish to Campus</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
