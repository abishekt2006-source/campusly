import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Film, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Layers, 
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, login } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await login('alex.cs@college.edu', 'password123');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 animate-fade-in shadow-glow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Exclusive to Verified College Students</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Your Entire Campus Life,{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            All in One Social Feed.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The hybrid of <span className="text-slate-200 font-semibold">Reddit</span> communities, <span className="text-slate-200 font-semibold">Snapchat</span> 24h stories, and <span className="text-slate-200 font-semibold">Instagram</span> media — reserved strictly for students of our university.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto btn-primary px-8 py-4 text-base flex items-center justify-center gap-3 shadow-glow-md"
          >
            <span>Claim Your Campus Profile</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          {!user ? (
            <button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto btn-secondary px-6 py-4 text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Explore as Demo Student</span>
            </button>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto btn-secondary px-6 py-4 text-base flex items-center justify-center gap-2"
            >
              <span>Go to Home Feed</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </Link>
          )}
        </div>

        {/* College Verified Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>@college.edu Email Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>24h Ephemeral Stories</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Moderated Department Clubs</span>
          </div>
        </div>

        {/* Interactive App Preview Mockup */}
        <div className="mt-16 max-w-5xl mx-auto rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-[#232d42]/60 to-[#121824]/60 border border-[#232d42] shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl bg-[#0a0d14] border border-[#232d42]/60 p-4 sm:p-6 overflow-hidden text-left">
            
            {/* Top Bar inside mockup */}
            <div className="flex items-center justify-between border-b border-[#232d42] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">campusly.apex.edu/feed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                142 Students Online Now
              </div>
            </div>

            {/* Stories Row Mockup */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Campus Stories</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[
                  { name: 'Your Story', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', active: false, add: true },
                  { name: 'CS Fest', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100', active: true },
                  { name: 'CanteenVibes', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=100', active: true },
                  { name: 'RoboticsLab', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100', active: true },
                  { name: 'SportsClub', img: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=100', active: false },
                ].map((s, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                    <div className={s.active ? 'story-ring-active' : 'story-ring-viewed'}>
                      <img
                        src={s.img}
                        alt={s.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#0a0d14] group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 max-w-[64px] truncate text-center">
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Card Preview Mockup */}
            <div className="p-4 rounded-2xl bg-[#121824] border border-[#232d42]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
                    alt="Student"
                    className="w-9 h-9 rounded-full object-cover border border-indigo-500/50"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">David Miller</span>
                      <span className="text-[11px] text-slate-400">• in</span>
                      <span className="text-xs font-semibold text-indigo-400">c/coding-club</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Computer Science • 2 hours ago</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  #Hackathon
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mb-3">
                Finalizing the teams for the Inter-College 24hr Hackathon this weekend! We have 2 slots left for a backend Python/FastAPI dev. Drop a comment or DM if interested! 🚀💻
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-[#232d42]">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Flame className="w-4 h-4" />
                  <span>48 Upvotes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>14 Comments</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 3 Pillars Feature Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#232d42]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Holy Trinity of Campus Socializing
          </h2>
          <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto">
            Everything your student body loves about modern platforms, tuned exclusively for your college culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Reddit Communities */}
          <div className="p-8 rounded-3xl bg-[#121824] border border-[#232d42] hover:border-indigo-500/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sub-Campus Communities</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create and join spaces for your branch, cultural fests, coding clubs, or anonymous confessions with Reddit-style voting and threaded discussions.
            </p>
          </div>

          {/* Card 2: Snapchat Stories */}
          <div className="p-8 rounded-3xl bg-[#121824] border border-[#232d42] hover:border-pink-500/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Film className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">24h Campus Stories</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Snap photos or short clips of campus fests, sports matches, or cafeteria moments. Automated 24-hour expiration keeps feeds fresh and spontaneous.
            </p>
          </div>

          {/* Card 3: Instagram Media & Profiles */}
          <div className="p-8 rounded-3xl bg-[#121824] border border-[#232d42] hover:border-purple-500/40 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">High-Res Media Feed</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload multi-image carousels and clips of campus milestones. Explore student portfolios, follow batchmates, and discover trending campus hashtags.
            </p>
          </div>

        </div>
      </section>

      {/* College Exclusivity Guarantee */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#121824] border border-indigo-500/30 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Strictly Verified. Zero Outsiders.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Registration requires an authorized college email domain or administrator verification. No external advertisers, no strangers — just you and your college peers.
          </p>
          <Link to="/register" className="btn-primary py-3 px-8 text-sm sm:text-base">
            Create Your Account Now
          </Link>
        </div>
      </section>

    </div>
  );
}
