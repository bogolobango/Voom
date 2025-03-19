import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fix for environment variables being swapped
// Using the correct values directly
const supabaseUrl = 'https://bdkslsvpnsiliqohdlkf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka3Nsc3ZwbnNpbGlxb2hkbGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTI5MjYsImV4cCI6MjA1Nzk4ODkyNn0.FXcBS7mpw-tCYeVQ29tVzIK1KvMZbk0XFjZyvV1y5KY';

console.log('Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

let supabaseInstance: SupabaseClient;

try {
  // Create a single supabase client for interacting with your database
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw error;
}

export const supabase = supabaseInstance;