import { createClient } from '@supabase/supabase-js';

// Fix for environment variables being swapped
// Using the correct values directly
const supabaseUrl = 'https://bdkslsvpnsiliqohdlkf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key is not defined in environment variables.');
}

// Create a Supabase client with the service role key for server-side operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});