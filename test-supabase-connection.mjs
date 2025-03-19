// test-supabase-connection.mjs
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Using the values from the project - directly from .env file
const supabaseUrl = 'https://bdkslsvpnsiliqohdlkf.supabase.co';
// Use the exact same service role key from .env file
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka3Nsc3ZwbnNpbGlxb2hkbGtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjQxMjkyNiwiZXhwIjoyMDU3OTg4OTI2fQ.R7TpZdtG8TvD3jsdN0E9ZMjQsdy_AsWv4rygP9ansEU';

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

async function testSupabaseConnection() {
  try {
    // Create the Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
    
    // Test authentication functionality
    console.log('Testing Supabase authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Error with authentication test:', authError);
    } else {
      console.log('Authentication successful!');
    }
    
    // Test storage functionality
    console.log('Testing Supabase storage...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing storage buckets:', bucketsError);
    } else {
      console.log('Storage buckets:', buckets);
    }
    
    // Simple connection test
    return true;
  } catch (error) {
    console.error('Exception when testing Supabase connection:', error);
    return false;
  }
}

// Run the test
try {
  const success = await testSupabaseConnection();
  console.log('\nConnection test complete.');
  console.log('Can connect to Supabase?', success ? 'Yes' : 'No');
  
  if (success) {
    console.log('\nNext Steps:');
    console.log('1. Run "npm run db:push" to create database tables');
    console.log('2. If prompted during migration, select the first option (create column)');
  } else {
    console.log('\nPlease check your Supabase credentials and permissions.');
  }
} catch (error) {
  console.error('Unhandled error during test:', error);
}