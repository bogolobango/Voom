/**
 * Module compatibility utilities to handle ESM/CommonJS differences
 * This helps with deployment compatibility issues
 */

/**
 * Get directory name in a way that works in both ESM and CommonJS
 */
export function getDirname(importMetaUrl: string): string {
  try {
    const url = new URL(importMetaUrl);
    const pathname = url.pathname;
    return pathname.substring(0, pathname.lastIndexOf('/'));
  } catch (e) {
    // Fallback for CommonJS
    return '.';
  }
}

/**
 * Resolves file URL paths in a way that works for both ESM and CJS
 * This is important for deployment where URLs might need different handling
 */
export function resolveFilePath(filePath: string, importMetaUrl?: string): string {
  try {
    if (importMetaUrl) {
      const url = new URL(filePath, importMetaUrl);
      return url.pathname;
    }
  } catch (e) {
    // Ignore errors in URL construction
  }
  
  return filePath;
}

/**
 * Safely handles Promise resolution for both async/await and callback patterns
 */
export function safeAwait<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
  return promise
    .then((data: T) => [null, data] as [null, T])
    .catch((err: Error) => [err, null] as [Error, null]);
}

/**
 * Safely imports a module using dynamic import
 * This works in both ESM and CommonJS environments
 */
export async function safeImport<T>(modulePath: string): Promise<T | null> {
  try {
    // Try dynamic import for ESM
    const module = await import(modulePath);
    return module as T;
  } catch (e) {
    // If dynamic import fails, try require
    try {
      // @ts-ignore - intentional fallback for CJS
      const module = require(modulePath);
      return module as T;
    } catch (e2) {
      // Both approaches failed
      return null;
    }
  }
}

/**
 * Creates a dual-format compatible export
 * This helps when exporting modules that need to work in both ESM and CJS
 */
export function createDualExport<T>(moduleExports: T): T {
  return moduleExports;
}