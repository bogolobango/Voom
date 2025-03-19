# Integration Guide

This document provides information about the external integrations used in this project.

## Supabase Integration

### Connection Status
✅ Successfully connected to Supabase!
- Supabase URL: https://bdkslsvpnsiliqohdlkf.supabase.co
- Authentication is working correctly
- Storage service is accessible

### Database Setup Instructions
To set up the database tables:

1. Run the database migration command:
   ```bash
   npm run db:push
   ```

2. When prompted during migration, select the first option (create column) for any questions.

3. Verify the tables are created correctly by running the test script:
   ```bash
   node test-supabase-connection.mjs
   ```

### Environment Variables
The following environment variables are required:
- `SUPABASE_URL` - The URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations
- `VITE_SUPABASE_URL` - Same as SUPABASE_URL, but prefixed with VITE_ for client access
- `VITE_SUPABASE_ANON_KEY` - Anon key for client-side operations

## GitHub Integration

### Repository Information
- Repository URL: https://github.com/bogolobango/Voom.git
- Remote name: origin

### Synchronization Instructions

#### Using Replit's Version Control UI (Recommended)
1. Click on the "Version Control" tab in the left sidebar (Git icon)
2. Review changes and stage files
3. Add a commit message
4. Click "Commit & Push"

#### Using Git Commands
```bash
# Add all changes
git add .

# Commit with a message
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

## Testing Integrations

### Test Supabase Connection
Run the Supabase connection test script:
```bash
node test-supabase-connection.mjs
```

This script verifies:
- Authentication with Supabase
- Access to storage functionality

### Test GitHub Connection
Check GitHub remote configuration:
```bash
git remote -v
```

Test connection to GitHub:
```bash
git fetch
```

If both Supabase and GitHub connections are working correctly, you're ready to use all features of the project.