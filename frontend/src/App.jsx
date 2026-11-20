import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CreatePostPage from './pages/CreatePostPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Unauthenticated Routes */}
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Main App Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="create-post" element={<CreatePostPage />} />
                <Route path="communities" element={<CommunitiesPage />} />
                <Route path="community/:slug" element={<CommunityDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/:username" element={<ProfilePage />} />
                <Route path="bookmarks" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="stories" element={<Navigate to="/" replace />} />
              </Route>

              {/* Catch-all 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
