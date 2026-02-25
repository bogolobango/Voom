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

// Optimized pool configuration for production workloads
const poolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
} : undefined;

// Custom logger for database operations
const dbLogger = {
  logQuery: (query: string, params: any) => {
    if (process.env.DEBUG_DB === 'true') {
      console.log(`SQL Query: ${query} - with params: ${JSON.stringify(params)}`);
    }
  },
};

// Create and export the connection pool (null when no DATABASE_URL)
export const pool = poolConfig ? new Pool(poolConfig) : null!;

// Create and export the drizzle database instance (null when no DATABASE_URL)
export const db = poolConfig ? drizzle({ client: pool, schema, logger: dbLogger }) : null!;

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Don't crash the process, just log the error
});

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
      // Only retry on connection-related errors
      if (
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === '40001' || // Serialization failure
        error.code === '40P01' // Deadlock detected
      ) {
        lastError = error;
        retries++;
        // Exponential backoff
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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const transactionDb = drizzle({ client, schema, logger: dbLogger });
    
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
  try {
    await pool.end();
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Register shutdown handlers
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
