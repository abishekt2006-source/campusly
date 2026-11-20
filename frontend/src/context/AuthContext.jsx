import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurable college domain from .env
  const collegeDomain = import.meta.env.VITE_COLLEGE_DOMAIN || 'college.edu';

  useEffect(() => {
    // 1. If Supabase is live, listen for real auth events
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // 2. Dev mode fallback: load cached demo user from localStorage if present
      const cached = localStorage.getItem('campusly_mock_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.warn('Could not fetch remote profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Student Registration
  const register = async ({ email, password, fullName, username, department, semester }) => {
    // Domain verification check
    if (collegeDomain && !email.toLowerCase().endsWith(`@${collegeDomain.toLowerCase()}`)) {
      throw new Error(`Only official college emails ending with @${collegeDomain} are allowed.`);
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            department,
            semester: parseInt(semester, 10),
            role: 'student',
            is_verified: true,
          },
        },
      });
      if (error) throw error;
      return data;
    } else {
      // Local dev simulation
      const mockId = 'usr_' + Date.now();
      const mockProfile = {
        id: mockId,
        email,
        full_name: fullName,
        username,
        department,
        semester: parseInt(semester, 10),
        role: 'student',
        is_verified: true,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        created_at: new Date().toISOString(),
      };
      const mockUser = { id: mockId, email };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('campusly_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      localStorage.setItem('campusly_token', 'dev_token_' + mockId);
      return { user: mockUser, profile: mockProfile };
    }
  };

  // Student Login
  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session?.access_token) {
        localStorage.setItem('campusly_token', data.session.access_token);
      }
      return data;
    } else {
      // Dev mode fallback
      const mockProfile = {
        id: 'usr_campus_lead',
        email,
        full_name: 'Alex Rivera',
        username: email.split('@')[0] || 'alexrivera',
        department: 'Computer Science',
        semester: 6,
        role: 'student',
        is_verified: true,
        bio: 'CS Junior • Hackathon enthusiast • Campus shutterbug 📸',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        followers_count: 248,
        following_count: 180,
      };
      const mockUser = { id: 'usr_campus_lead', email };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('campusly_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      localStorage.setItem('campusly_token', 'dev_token_campus_lead');
      return { user: mockUser, profile: mockProfile };
    }
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('campusly_mock_user');
    localStorage.removeItem('campusly_token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        collegeDomain,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
