import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Send, 
  Clock, 
  Film, 
  Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function CreateStoryModal({ onClose, onStoryCreated }) {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/stories/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMediaUrl(res.data.url);
      setMediaType(res.data.media_type);
      addToast('Story media uploaded!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not upload media file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUrl) {
      addToast('Please select or upload a photo/video story.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/stories', {
        media_url: mediaUrl,
        media_type: mediaType,
        caption: caption.trim(),
        duration: parseInt(duration, 10),
      });

      addToast('Story posted! Expires in 24 hours.', 'success');
      if (onStoryCreated) onStoryCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || 'Failed to post story', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#121824] border border-[#232d42] shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232d42]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Campus Story</h3>
              <p className="text-[11px] text-slate-400">Self-expires automatically in 24 hours</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview / Upload Dropzone */}
        {mediaUrl ? (
          <div className="relative rounded-2xl overflow-hidden aspect-[9/12] max-h-72 bg-black/60 border border-[#232d42] mx-auto">
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full h-full object-contain" />
            ) : (
              <img src={mediaUrl} alt="Story preview" className="w-full h-full object-contain" />
            )}
            <button
              onClick={() => setMediaUrl('')}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {caption && (
              <div className="absolute bottom-3 inset-x-3 p-2 rounded-xl bg-black/60 text-white text-xs text-center">
                {caption}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#151d2d]/60 border border-dashed border-[#232d42] hover:border-pink-500/50 transition-colors text-center relative">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <UploadCloud className="w-10 h-10 text-pink-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {uploading ? 'Uploading media...' : 'Upload Photo or Short Video'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Snap campus fest rehearsals, canteen moments, or lab clips
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Caption */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Story Caption (Optional)
          </label>
          <input
            type="text"
            placeholder="Add a snappy campus caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={255}
            className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
          />
        </div>

        {/* Duration Slider (For Photos) */}
        {mediaType === 'image' && (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Display Duration:</span>
              </span>
              <span className="text-indigo-400 font-mono">{duration} seconds</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-[#232d42]">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2.5 px-4 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading || !mediaUrl}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-glow-sm"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Publish 24h Story</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
