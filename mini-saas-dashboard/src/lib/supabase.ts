import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//stop runtime crashes by validating keys instantly
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables inside .env.local configuration file.');
}

// Export a single, cached, highly efficient instance of the database manager
export const supabase = createClient(supabaseUrl, supabaseAnonKey);