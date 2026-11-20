import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Flame, Users, Calendar, Sparkles, Hash, ArrowRight } from 'lucide-react';

export default function ExplorePage() {
  const trendingTags = [
    { tag: 'TechFest2026', count: '142 posts', growth: '+28% today' },
    { tag: 'CampusLife', count: '89 posts', growth: '+15% today' },
    { tag: 'Hackathon', count: '64 posts', growth: '+45% today' },
    { tag: 'ExamWeek', count: '52 posts', growth: 'Hot' },
    { tag: 'CanteenVibes', count: '39 posts', growth: '+10%' },
  ];

  const featuredClubs = [
    {
      name: 'Computer Science Dept',
      slug: 'cs-dept',
      desc: 'Coding, projects, academic notes & hackathon squads.',
      members: '1,240',
      banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    },
    {
      name: 'Campus Photography Club',
      slug: 'shutterbugs',
      desc: 'Campus sunsets, fest portraits, and photography walks.',
      members: '640',
      banner: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    },
    {
      name: 'Campus Memes & Banter',
      slug: 'campus-memes',
      desc: 'Relatable canteen chronicles, professor humor, and laughter.',
      members: '2,400',
      banner: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#121824] border border-indigo-500/30 relative overflow-hidden">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Discover Campus</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Explore What's Happening Around College
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-xl">
          Browse popular campus hashtags, discover sub-communities, and find upcoming fests and events.
        </p>
      </div>

      {/* Trending Hashtags Grid */}
      <div className="p-6 rounded-3xl bg-[#121824] border border-[#232d42]">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Trending Campus Hashtags</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trendingTags.map((item) => (
            <Link
              key={item.tag}
              to={`/search?q=%23${item.tag}`}
              className="p-3.5 rounded-2xl bg-[#151d2d] border border-[#232d42] hover:border-indigo-500/40 hover:bg-[#1b2333] transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                  #{item.tag}
                </p>
                <p className="text-xs text-slate-400">{item.count}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {item.growth}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Communities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Popular Sub-Communities</h2>
          </div>
          <Link to="/communities" className="text-xs font-semibold text-indigo-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredClubs.map((club) => (
            <div
              key={club.slug}
              className="rounded-3xl bg-[#121824] border border-[#232d42] overflow-hidden group hover:border-indigo-500/40 transition-all"
            >
              <div className="h-28 overflow-hidden relative">
                <img
                  src={club.banner}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent" />
              </div>
              <div className="p-4 pt-2">
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {club.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{club.desc}</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#232d42]">
                  <span className="text-xs text-slate-400">{club.members} students</span>
                  <Link
                    to={`/community/${club.slug}`}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                  >
                    <span>Visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
