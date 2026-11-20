import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, Film, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { profile } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[#232d42] bg-[#0a0d14]/95 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Explore</span>
      </NavLink>

      {/* Floating Create Button */}
      <NavLink
        to="/create-post"
        className="flex flex-col items-center justify-center -mt-6 p-2 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 hover:scale-105 transition-transform"
      >
        <PlusCircle className="w-7 h-7" />
      </NavLink>

      <NavLink
        to="/stories"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`
        }
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px]">Stories</span>
      </NavLink>

      <NavLink
        to={profile?.username ? `/profile/${profile.username}` : '/profile'}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">Profile</span>
      </NavLink>
    </nav>
  );
}
