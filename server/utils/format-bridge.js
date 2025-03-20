/**
 * Format bridge: Compatibility layer for ESM/CJS modules
 * This file is intentionally in plain JavaScript for maximum compatibility
 * across different module formats and bundlers.
 */

/**
 * Import a module in a format-compatible way
 * Works in both ESM and CJS environments
 */
async function importModule(modulePath) {
  try {
    // Try dynamic import first (ESM approach)
    return await import(modulePath);
  } catch (importError) {
    try {
      // Fallback to require (CJS approach)
      // We use a string-based eval here to avoid syntax errors in ESM context
      // where "require" is not defined
      return eval('require')(modulePath);
    } catch (requireError) {
      console.error('Failed to import module using both ESM and CJS methods', requireError);
      return null;
    }
  }
}

/**
 * Execute a function safely with error handling
 */
async function safeExecute(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    console.error('Error in safe execute:', error);
    return null;
  }
}

/**
 * Create a dual-format export that works in both ESM and CJS
 */
function createDualExport(exportObject) {
  return exportObject;
}

/**
 * Resolve a path in a way that's compatible with both formats
 */
function resolveCompatiblePath(relativePath) {
  try {
    // Check if we're in ESM
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const url = new URL(relativePath, import.meta.url);
      return url.pathname;
    }
  } catch (e) {
    // Ignore ESM detection errors
  }
  
  // CJS fallback
  try {
    const path = require('path');
    const dirname = __dirname;
    return path.resolve(dirname, relativePath);
  } catch (e) {
    // Last resort
    return relativePath;
  }
}

/**
 * Get the current module format
 */
function getModuleFormat() {
  return typeof import.meta !== 'undefined' ? 'esm' : 'cjs';
}

/**
 * Simple logger that works in both formats
 */
function log(message) {
  console.log(`[Format-Bridge] ${message}`);
}

// Creating a bridge object with all utilities
const formatBridge = {
  importModule,
  safeExecute,
  createDualExport,
  resolveCompatiblePath,
  getModuleFormat,
  log
};

// Make it compatible with both ESM and CJS
// ESM export
export default formatBridge;

// CJS export (ignored in ESM)
try {
  module.exports = formatBridge;
} catch (e) {
  // In ESM, module.exports doesn't exist, so this will error
  // That's expected and we can safely ignore it
}