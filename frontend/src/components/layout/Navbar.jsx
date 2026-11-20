import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  User, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X,
  Compass,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232d42] bg-[#0a0d14]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                CAMPUSLY
              </span>
              <span className="text-[10px] tracking-wider text-indigo-400 font-semibold uppercase -mt-1">
                College Exclusive
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, #hashtags, communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full glass-input"
          />
        </form>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          {user ? (
            <>
              {/* Notifications Link */}
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </Link>

              {/* Profile Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-[#232d42] hover:border-indigo-500/50 bg-[#121824] transition-all"
                >
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
                    {profile?.username || 'Student'}
                  </span>
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'campus'}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/50"
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121824] border border-[#232d42] shadow-2xl py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#232d42]">
                      <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Verified Student'}</p>
                      <p className="text-xs text-indigo-400 truncate">@{profile?.username} • {profile?.department || 'Student'}</p>
                    </div>

                    <Link
                      to={`/profile/${profile?.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/10 transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      View Profile
                    </Link>

                    <Link
                      to="/explore"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/10 transition-colors"
                    >
                      <Compass className="w-4 h-4 text-indigo-400" />
                      Explore Campus
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/10 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-indigo-400" />
                      Saved Posts
                    </Link>

                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="my-1 border-t border-[#232d42]" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-xs sm:text-sm py-2 px-3.5">
                Log In
              </Link>
              <Link to="/register" className="btn-primary text-xs sm:text-sm py-2 px-3.5">
                Join Campus
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-[#232d42] bg-[#0a0d14] space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Campusly..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl glass-input"
            />
          </form>
        </div>
      )}
    </header>
  );
}
