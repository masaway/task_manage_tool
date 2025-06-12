import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'dummy-key';

// Supabase接続可能かチェック
export const isSupabaseConfigured = () => {
  return process.env.REACT_APP_SUPABASE_URL && 
         process.env.REACT_APP_SUPABASE_ANON_KEY &&
         process.env.REACT_APP_SUPABASE_URL !== 'https://dummy.supabase.co';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);