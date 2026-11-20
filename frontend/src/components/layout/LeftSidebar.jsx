import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Film, 
  Users, 
  Bell, 
  Bookmark, 
  User, 
  PlusSquare, 
  ShieldCheck, 
  Sparkles,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LeftSidebar() {
  const { user, profile } = useAuth();

  const navItems = [
    { label: 'Home Feed', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Campus Stories', path: '/stories', icon: Film, badge: 'Live' },
    { label: 'Communities', path: '/communities', icon: Users },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { label: 'My Profile', path: profile?.username ? `/profile/${profile.username}` : '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 sticky top-20 hidden lg:flex flex-col gap-6 py-2 select-none h-[calc(100vh-5.5rem)]">
      
      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/30 shadow-glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#121824]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Action: Create Post */}
      <div className="pt-2">
        <Link
          to="/create-post"
          className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 shadow-glow-sm"
        >
          <PlusSquare className="w-5 h-5" />
          <span className="font-semibold text-sm">Create Post</span>
        </Link>
      </div>

      {/* Mini Profile Card */}
      {user && profile && (
        <div className="p-3.5 rounded-2xl bg-[#121824] border border-[#232d42] flex items-center gap-3">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
            alt={profile.username}
            className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
              {profile.is_verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Verified College Student" />
              )}
            </div>
            <p className="text-xs text-indigo-400 truncate">@{profile.username}</p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
        <span>© 2026 Campusly</span>
        <span>•</span>
        <Link to="/about" className="hover:underline">About</Link>
        <span>•</span>
        <Link to="/guidelines" className="hover:underline">Rules</Link>
        <span>•</span>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
      </div>
    </aside>
  );
}
