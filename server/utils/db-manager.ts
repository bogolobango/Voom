/**
 * Database connection and transaction management utilities
 */
import { Pool, PoolClient } from 'pg';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Logger } from 'drizzle-orm';
import * as schema from '@shared/schema';

// Custom logger for query debugging
const customLogger: Logger = {
  logQuery: (query, params) => {
    if (process.env.DEBUG_DB === 'true') {
      console.log(`SQL Query: ${query} - with params: ${JSON.stringify(params)}`);
    }
  },
};

// Optimized pool configuration for production workloads
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'production' ? 20 : 10, // Maximum connections in pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  allowExitOnIdle: false, // Don't allow the pool to exit while we're using it
};

// Create and export the connection pool
export const pool = new Pool(poolConfig);

// Create and export the drizzle database instance
export const db = drizzle(pool, { schema, logger: customLogger });

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Don't crash the process, just log the error
});

/**
 * Execute a query with automatic retries for transient errors
 * @param queryFn Function that executes the query
 * @param maxRetries Maximum number of retry attempts
 * @returns Query result
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
 * @param fn Function to execute within transaction
 * @returns Result of the function
 */
export async function withTransaction<T>(
  fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const transactionDb = drizzle(client, { schema, logger: customLogger });
    
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
  console.log('Closing database connections...');
  try {
    await pool.end();
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Handle application termination
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});