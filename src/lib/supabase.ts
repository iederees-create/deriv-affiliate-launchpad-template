import { createClient } from '@supabase/supabase-js';

// Using explicit variables instead of .env to ensure GitHub Pages CI builds successfully
// Note: Supabase anon keys are safe to expose in frontend client code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sijvvbozaufzpjirijhb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpanZ2Ym96YXVmenBqaXJpamhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzY3NTMsImV4cCI6MjEwMDkxMjc1M30.MPHqlZuOySK56JZh_OBpFe79I-V0Zy6puI_Kw7bcx8Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: {
  persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
  storageKey: 'apex-trade-network-auth'
}});
