import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Users, 
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function StoryViewerModal({ 
  groups = [], 
  initialGroupIndex = 0, 
  onClose,
  onStoryDeleted 
}) {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  const isAuthor = user && (user.id === currentStory?.author?.id || profile?.username === currentStory?.author?.username);

  // Mark story as viewed on backend
  useEffect(() => {
    if (currentStory?.id) {
      api.post(`/stories/${currentStory.id}/view`).catch(() => {});
    }
  }, [currentStory?.id]);

  // Handle story progress timer
  useEffect(() => {
    if (!currentStory || isPaused || viewersOpen) return;

    const durationMs = (currentStory.duration || 5) * 1000;
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [groupIndex, storyIndex, isPaused, viewersOpen, currentStory]);

  const handleNextStory = () => {
    setProgress(0);
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
    } else {
      // Finished all stories
      onClose();
    }
  };

  const handlePrevStory = () => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((prev) => prev - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  };

  // Screen click navigation: left side = previous, right side = next
  const handleScreenClick = (e) => {
    if (viewersOpen) return;
    const clickX = e.clientX;
    const screenWidth = window.innerWidth;
    if (clickX < screenWidth * 0.35) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  // Fetch viewers
  const handleOpenViewers = async () => {
    setIsPaused(true);
    setViewersOpen(true);
    setLoadingViewers(true);
    try {
      const res = await api.get(`/stories/${currentStory.id}/viewers`);
      setViewersList(res.data);
    } catch (err) {
      console.warn('Could not load viewers:', err.message);
    } finally {
      setLoadingViewers(false);
    }
  };

  // Delete story
  const handleDelete = async () => {
    if (!window.confirm('Delete this active story?')) return;
    try {
      await api.delete(`/stories/${currentStory.id}`);
      addToast('Story deleted', 'success');
      if (onStoryDeleted) onStoryDeleted(currentStory.id);
      handleNextStory();
    } catch (err) {
      addToast('Could not delete story', 'error');
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-fade-in">
      
      {/* Container: 9:16 mobile story aspect */}
      <div 
        className="relative w-full max-w-md h-full sm:h-[92vh] sm:rounded-3xl overflow-hidden bg-[#0a0d14] flex flex-col justify-between shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        
        {/* Story Media Background */}
        <div className="absolute inset-0 z-0 bg-black" onClick={handleScreenClick}>
          {currentStory.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt="Story media"
              className="w-full h-full object-contain"
            />
          )}
          {/* Subtle gradient overlay on top and bottom */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Top Header & Segmented Progress Bars */}
        <div className="relative z-20 p-4 space-y-3 pointer-events-auto">
          {/* Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {currentGroup.stories.map((st, i) => (
              <div key={st.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 rounded-full"
                  style={{
                    width:
                      i < storyIndex
                        ? '100%'
                        : i === storyIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Details & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentGroup.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentGroup.author?.username}`}
                alt={currentGroup.author?.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white leading-tight">
                    {currentGroup.author?.full_name}
                  </span>
                  {currentGroup.author?.is_verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-white/70">
                  @{currentGroup.author?.username} • {currentGroup.author?.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-black/40 text-white/80 hover:text-rose-400 hover:bg-black/60 transition-colors"
                  title="Delete Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Left/Right Navigation Chevron triggers */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Caption & Viewers Bar */}
        <div className="relative z-20 p-5 space-y-4 pointer-events-auto">
          {/* Caption */}
          {currentStory.caption && (
            <div className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm font-medium leading-relaxed">
              {currentStory.caption}
            </div>
          )}

          {/* Author Viewers Trigger */}
          {isAuthor ? (
            <button
              onClick={handleOpenViewers}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold transition-all border border-white/20"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Seen by {currentStory.viewers_count || 0} students</span>
            </button>
          ) : (
            <div className="text-center text-[11px] text-white/60">
              Tap left/right to navigate • Hold to pause
            </div>
          )}
        </div>

        {/* Author Viewers Slide-up Drawer */}
        {viewersOpen && (
          <div 
            className="absolute inset-x-0 bottom-0 max-h-[60%] bg-[#121824] border-t border-[#232d42] rounded-t-3xl z-30 p-5 flex flex-col animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#232d42]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Story Viewers</h4>
              </div>
              <button
                onClick={() => { setViewersOpen(false); setIsPaused(false); }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {loadingViewers ? (
                <div className="py-6 flex justify-center">
                  <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : viewersList.length === 0 ? (
                <p className="text-xs text-center text-slate-500 py-4">
                  No views yet on this campus story.
                </p>
              ) : (
                viewersList.map((viewer) => (
                  <div key={viewer.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={viewer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${viewer.username}`}
                        alt={viewer.username}
                        className="w-8 h-8 rounded-full object-cover border border-[#232d42]"
                      />
                      <div>
                        <p className="font-semibold text-white truncate">{viewer.full_name}</p>
                        <p className="text-[10px] text-indigo-400">@{viewer.username} • {viewer.department}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">Viewed</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
