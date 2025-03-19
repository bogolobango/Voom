// test-supabase-connection.js
const { createClient } = require('@supabase/supabase-js');

// Using the values from the project
const supabaseUrl = 'https://bdkslsvpnsiliqohdlkf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

async function testSupabaseConnection() {
  try {
    // Create the Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
testSupabaseConnection()
  .then(success => {
    console.log('Connection test complete. Success:', success);
    if (!success) {
      console.log('Please check your Supabase credentials and permissions.');
    }
  });