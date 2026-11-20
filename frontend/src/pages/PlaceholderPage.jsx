import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Construction, ArrowLeft } from 'lucide-react';

export default function PlaceholderPage({ title, description, phaseNumber }) {
  const location = useLocation();

  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-[#121824] border border-[#232d42] text-center max-w-xl mx-auto my-8 animate-fade-in shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
        <Sparkles className="w-7 h-7" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        Scheduled for Phase {phaseNumber || 'Upcoming'}
      </span>
      <h1 className="text-2xl font-extrabold text-white mt-4 mb-2">
        {title || 'Campusly Feature'}
      </h1>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {description || 'This interface is being actively connected in our structured development phases.'}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Feed</span>
        </Link>
      </div>
    </div>
  );
}
