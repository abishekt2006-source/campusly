import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Campusly: Supabase credentials are not set in frontend/.env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect live authentication.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
