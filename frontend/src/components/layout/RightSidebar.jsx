import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Calendar, UserPlus, Users, ArrowRight } from 'lucide-react';

export default function RightSidebar() {
  const trendingCommunities = [
    {
      name: 'Computer Science Dept',
      slug: 'cs-dept',
      members: '1.2k',
      avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100',
    },
    {
      name: 'Campus Memes & Banter',
      slug: 'campus-memes',
      members: '2.4k',
      avatar: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=100',
    },
    {
      name: 'Coding & Hackathons',
      slug: 'coding-club',
      members: '890',
      avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100',
    },
    {
      name: 'Photography Club',
      slug: 'shutterbugs',
      members: '640',
      avatar: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100',
    },
  ];

  const upcomingEvents = [
    {
      title: 'Annual Tech Fest 2026',
      date: 'NOV 28',
      location: 'Main Auditorium',
      tag: 'Fest',
    },
    {
      title: 'Inter-College Hackathon',
      date: 'DEC 05',
      location: 'CS Lab 3',
      tag: 'Hackathon',
    },
    {
      title: 'Acoustic Jam Night',
      date: 'DEC 12',
      location: 'Open Amphitheatre',
      tag: 'Cultural',
    },
  ];

  return (
    <aside className="w-80 sticky top-20 hidden xl:flex flex-col gap-6 py-2 h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
      
      {/* Trending Communities Card */}
      <div className="p-4 rounded-3xl bg-[#121824] border border-[#232d42]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#232d42]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Trending Communities</h3>
          </div>
          <Link to="/communities" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {trendingCommunities.map((comm) => (
            <div key={comm.slug} className="flex items-center justify-between gap-3 group">
              <Link to={`/community/${comm.slug}`} className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={comm.avatar}
                  alt={comm.name}
                  className="w-9 h-9 rounded-xl object-cover border border-[#232d42] group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                    c/{comm.slug}
                  </p>
                  <p className="text-[11px] text-slate-400">{comm.members} members</p>
                </div>
              </Link>
              <Link
                to={`/community/${comm.slug}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1b2333] hover:bg-indigo-600 text-slate-200 hover:text-white font-medium transition-colors"
              >
                Join
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Events Card */}
      <div className="p-4 rounded-3xl bg-[#121824] border border-[#232d42]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#232d42]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Campus Happenings</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
            Official
          </span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((evt, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#1b2333]/70 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/40 border border-indigo-500/30 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] uppercase font-bold text-indigo-400">{evt.date.split(' ')[0]}</span>
                <span className="text-sm font-extrabold text-white leading-tight">{evt.date.split(' ')[1]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{evt.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{evt.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Peers Card */}
      <div className="p-4 rounded-3xl bg-[#121824] border border-[#232d42]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#232d42]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Suggested Batchmates</h3>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Sarah Chen', username: 'sarah_c', dept: 'CS • Sem 6' },
            { name: 'Rohan Sharma', username: 'rohan_s', dept: 'ECE • Sem 4' },
          ].map((peer, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${peer.username}`}
                  alt={peer.name}
                  className="w-8 h-8 rounded-full border border-[#232d42]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{peer.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{peer.dept}</p>
                </div>
              </div>
              <button className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
