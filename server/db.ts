import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Database features will be unavailable (using in-memory storage).",
  );
}

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const poolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  // Serverless: keep pool tiny to avoid exhausting Supabase connection limit
  max: isServerless ? 3 : 10,
  idleTimeoutMillis: isServerless ? 10000 : 30000,
  connectionTimeoutMillis: 5000,
} : undefined;

// Create and export the connection pool (null when no DATABASE_URL)
export const pool = poolConfig ? new Pool(poolConfig) : null!;

// Create and export the drizzle database instance (null when no DATABASE_URL)
export const db = poolConfig ? drizzle({ client: pool, schema }) : null!;

// Handle pool errors to prevent crashes
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });
}

/**
 * Execute a query with automatic retries for transient errors
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await queryFn();
    } catch (error: any) {
      if (
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === '40001' ||
        error.code === '40P01'
      ) {
        lastError = error;
        retries++;
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retries)));
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Query failed after retries');
}

/**
 * Execute a function within a database transaction
 */
export async function withTransaction<T>(
  fn: (db: NeonDatabase<typeof schema>) => Promise<T>
): Promise<T> {
  if (!pool) throw new Error("Database not configured (DATABASE_URL missing)");
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const transactionDb = drizzle({ client, schema });
    const result = await fn(transactionDb);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown function
export async function closeDatabase() {
  if (!pool) return;
  try {
    await pool.end();
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Only register shutdown handlers in long-running server mode, not serverless
if (!isServerless) {
  process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await closeDatabase();
    process.exit(0);
  });
}
