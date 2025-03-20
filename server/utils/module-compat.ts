/**
 * Module compatibility utilities to handle ESM/CommonJS differences
 * This helps with deployment compatibility issues
 */
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Get directory name in a way that works in both ESM and CommonJS
 */
export function getDirname(importMetaUrl: string): string {
  try {
    const __filename = fileURLToPath(importMetaUrl);
    return path.dirname(__filename);
  } catch (e) {
    // Fallback for CommonJS environments
    return process.cwd();
  }
}

/**
 * Safely handles Promise resolution for both async/await and callback patterns
 */
export function safeAwait<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
  return promise
    .then(data => [null, data] as [null, T])
    .catch(err => [err, null] as [Error, null]);
}

/**
 * Safely imports a module using dynamic import
 * This works in both ESM and CommonJS environments
 */
export async function safeImport<T>(modulePath: string): Promise<T | null> {
  try {
    const module = await import(modulePath);
    return module.default || module;
  } catch (e) {
    console.error(`Failed to import module: ${modulePath}`, e);
    return null;
  }
}