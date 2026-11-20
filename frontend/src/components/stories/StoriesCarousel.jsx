import React, { useState, useEffect } from 'react';
import { Plus, Film } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StoryViewerModal from './StoryViewerModal';
import CreateStoryModal from './CreateStoryModal';
import api from '../../services/api';

export default function StoriesCarousel() {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      setGroups(res.data);
    } catch (err) {
      console.warn('Could not fetch stories from backend:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleOpenViewer = (index) => {
    setActiveGroupIndex(index);
    setViewerOpen(true);
  };

  const handleStoryCreated = () => {
    fetchStories();
  };

  const handleStoryDeleted = () => {
    fetchStories();
  };

  // Check if current user has active stories in the reel
  const userGroupIndex = groups.findIndex(
    (g) => g.author?.id === user?.id || g.author?.username === profile?.username
  );

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#121824] border border-[#232d42] shadow-xl">
      
      {/* Top Label */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Campus Stories (24h)
          </h2>
        </div>
        <span className="text-[11px] text-slate-500">
          Tap circle to view • Self-expiring
        </span>
      </div>

      {/* Stories Scrollable Row */}
      <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
        
        {/* Current User Story Circle */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
          <div className="relative">
            <div 
              onClick={() => {
                if (userGroupIndex !== -1) {
                  handleOpenViewer(userGroupIndex);
                } else {
                  setCreateModalOpen(true);
                }
              }}
              className={userGroupIndex !== -1 ? 'story-ring-active' : 'story-ring-viewed'}
            >
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
                alt="My Story"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#121824] group-hover:scale-105 transition-transform"
              />
            </div>
            
            {/* Plus button to add a new story */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreateModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 border-2 border-[#121824] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
              title="Add Campus Story"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[11px] font-medium text-slate-300 max-w-[68px] truncate text-center">
            Your Story
          </span>
        </div>

        {/* Other Students' Stories */}
        {groups.map((group, idx) => {
          // Skip if already rendered as "Your Story"
          if (idx === userGroupIndex) return null;

          return (
            <div
              key={group.author?.id || idx}
              onClick={() => handleOpenViewer(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className={group.has_unseen ? 'story-ring-active' : 'story-ring-viewed'}>
                <img
                  src={group.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${group.author?.username}`}
                  alt={group.author?.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#121824] group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-300 max-w-[68px] truncate text-center">
                {group.author?.username}
              </span>
            </div>
          );
        })}

      </div>

      {/* Story Viewer Modal */}
      {viewerOpen && (
        <StoryViewerModal
          groups={groups}
          initialGroupIndex={activeGroupIndex}
          onClose={() => setViewerOpen(false)}
          onStoryDeleted={handleStoryDeleted}
        />
      )}

      {/* Create Story Modal */}
      {createModalOpen && (
        <CreateStoryModal
          onClose={() => setCreateModalOpen(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

    </div>
  );
}
