import { spawn } from 'child_process';
import process from 'process';

// Create a child process for the drizzle-kit push command
const child = spawn('npx', ['drizzle-kit', 'push'], {
  stdio: ['pipe', process.stdout, process.stderr]
});

// When the command prompts for input, automatically select the first option
child.stdin.on('data', (data) => {
  child.stdin.write('\n'); // Select the default option
});

// If the child process throws an error
child.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

// When the child process exits
child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Process exited with code ${code} and signal ${signal}`);
    process.exit(code);
  }
  console.log('Migration completed successfully!');
});

// Set a timeout to terminate if the process hangs
setTimeout(() => {
  console.log('Migration timed out. You may need to run it manually.');
  child.kill();
  process.exit(1);
}, 60000); // 60 seconds timeout