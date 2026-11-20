import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Megaphone, 
  CheckCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Could not mark all as read', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Notifications</h1>
            <p className="text-xs text-slate-400">Stay updated on interactions with your campus posts</p>
          </div>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#121824] border border-[#232d42] text-center space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
            <p className="text-sm font-bold text-white">All caught up!</p>
            <p className="text-xs text-slate-400">No new alerts at this moment.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                !n.is_read
                  ? 'bg-gradient-to-r from-indigo-950/40 to-[#121824] border-indigo-500/40 shadow-glow-sm'
                  : 'bg-[#121824] border-[#232d42]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#151d2d] border border-[#232d42] flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  {n.sender ? (
                    <Link to={`/profile/${n.sender.username}`} className="font-bold text-white hover:underline">
                      @{n.sender.username}
                    </Link>
                  ) : null}
                  <span>{n.message}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
