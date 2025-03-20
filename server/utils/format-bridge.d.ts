/**
 * Type definitions for format-bridge.js
 */

declare interface FormatBridge {
  /**
   * Import a module in a format-compatible way
   * Works in both ESM and CJS environments
   */
  importModule: <T>(modulePath: string) => Promise<T | null>;
  
  /**
   * Execute a function safely with error handling
   */
  safeExecute: <T, Args extends any[]>(fn: (...args: Args) => Promise<T> | T, ...args: Args) => Promise<T | null>;
  
  /**
   * Create a dual-format export that works in both ESM and CJS
   */
  createDualExport: <T>(exportObject: T) => T;
  
  /**
   * Resolve a path in a way that's compatible with both formats
   */
  resolveCompatiblePath: (relativePath: string) => string;
  
  /**
   * Get the current module format (ESM or CJS)
   */
  getModuleFormat: () => 'esm' | 'cjs';
  
  /**
   * Simple logger that works in both formats
   */
  log: (message: string) => void;
}

declare const formatBridge: FormatBridge;

export default formatBridge;