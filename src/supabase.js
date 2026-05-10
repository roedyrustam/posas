import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gagjfswsqycsxubfgdin.supabase.co';
const supabaseAnonKey = 'sb_publishable_Y0wf0TGzMjD5GEJ1X0Ufjw_LhTkvKc2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
