import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These environment variables will need to be set in the .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log('Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

let supabaseInstance: SupabaseClient;

try {
  // Verify URL is valid
  new URL(supabaseUrl);
  
  // Create a single supabase client for interacting with your database
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
} catch (error) {
  console.error('Invalid Supabase URL:', error);
  throw error;
}

export const supabase = supabaseInstance;