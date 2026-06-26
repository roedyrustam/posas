import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vkkzfcwofymrltqvfmdf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PxUyYKbrXyoWNMi6y8mSmg_3uH8jkbt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
