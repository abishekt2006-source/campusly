import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Bell, 
  Lock, 
  LogOut, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { user, profile, logout, collegeDomain } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppSound, setInAppSound] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Account Settings</h1>
          <p className="text-xs text-slate-400">Manage your display preferences and campus security</p>
        </div>
      </div>

      {/* Theme & Display */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>Appearance & Theme</span>
        </h3>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-semibold text-slate-200">Dark Mode (Default)</p>
            <p className="text-[11px] text-slate-400">Switch between deep dark mode and modern light theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>Notification Preferences</span>
        </h3>
        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">Email alerts for comment replies & mentions</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              className="w-4 h-4 rounded text-indigo-600 bg-[#151d2d] border-[#232d42]"
            />
          </label>
        </div>
      </div>

      {/* College Institutional Verification */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>College Verification Info</span>
        </h3>
        <div className="p-4 rounded-2xl bg-[#151d2d] border border-[#232d42] text-xs space-y-1">
          <p className="text-slate-300">
            Registered Email Domain: <strong className="text-white font-mono">@{collegeDomain}</strong>
          </p>
          <p className="text-slate-400 text-[11px]">
            Your account is confirmed and verified as an active student of this campus.
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-rose-500/20 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Session & Logout</span>
        </h3>
        <p className="text-xs text-slate-400">
          Sign out of your active student session on this browser.
        </p>
        <button
          onClick={() => {
            logout();
            addToast('Signed out of Campusly.', 'info');
          }}
          className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors"
        >
          Sign Out of Campusly
        </button>
      </div>

    </div>
  );
}
