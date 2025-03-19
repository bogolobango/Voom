// db-push.mjs
import { exec } from 'child_process';

// Execute the drizzle-kit push command with --force flag to skip interactive prompts
exec('npx drizzle-kit push --force', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing migration: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
  }
  
  console.log(`Migration stdout: ${stdout}`);
  console.log('Database migration completed successfully!');
});