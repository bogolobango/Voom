// test-supabase-connection.mjs
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Using the values from the project - directly from .env file
const supabaseUrl = 'https://bdkslsvpnsiliqohdlkf.supabase.co';
// Use the exact same service role key from .env file
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka3Nsc3ZwbnNpbGlxb2hkbGtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjQxMjkyNiwiZXhwIjoyMDU3OTg4OTI2fQ.R7TpZdtG8TvD3jsdN0E9ZMjQsdy_AsWv4rygP9ansEU';

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);
console.log('Service Key type:', typeof supabaseServiceKey);
console.log('Service Key length:', supabaseServiceKey.length);

async function testSupabaseConnection() {
  try {
    // Create the Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
    
    // Test connection by making a simple query
    console.log('Attempting to query Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('Exception when testing Supabase connection:', error);
    return false;
  }
}

// Run the test
try {
  const success = await testSupabaseConnection();
  console.log('Connection test complete. Success:', success);
  if (!success) {
    console.log('Please check your Supabase credentials and permissions.');
  }
} catch (error) {
  console.error('Unhandled error during test:', error);
}