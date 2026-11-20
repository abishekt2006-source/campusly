import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  const location = useLocation();

  // Pages that don't need sidebars (Auth, Landing, Fullscreen Story Viewer)
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isLandingPage = location.pathname === '/welcome';
  const isFullscreenViewer = location.pathname.startsWith('/stories/view');

  if (isFullscreenViewer) {
    return <Outlet />;
  }

  if (isAuthPage || isLandingPage) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-8 py-6 pb-24 lg:pb-8">
        {/* Left Navigation Sidebar */}
        <LeftSidebar />

        {/* Central Dynamic Content Feed */}
        <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Right Info Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <MobileNav />
    </div>
  );
}
