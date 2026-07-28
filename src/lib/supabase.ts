import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lujfnviekfnaxofrdwdc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1amZudmlla2ZuYXhvZnJkd2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTg0MDUsImV4cCI6MjEwMDQ3NDQwNX0.a9Hb-vBp-1ULdp6bJQxXfIfcIEoEHr9q6kC_NtAQFcQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};
