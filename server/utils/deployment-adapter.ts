/**
 * Deployment compatibility adapter
 * 
 * This module provides workarounds for common deployment issues related to module formats
 * and environment differences between development and production.
 */
import { createDualExport } from './module-compat';

interface BuildInfo {
  format: 'cjs' | 'esm';
  buildTime: string;
  nodeVersion: string;
  environment: 'development' | 'production';
}

/**
 * Detects the current environment's module format
 * @returns Information about the current build environment
 */
export function detectModuleFormat(): BuildInfo {
  // Check if we're in a CommonJS or ESM environment
  const isESM = typeof import.meta !== 'undefined';
  
  const info: BuildInfo = {
    format: isESM ? 'esm' : 'cjs',
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
  };
  
  return info;
}

/**
 * Fix path resolution issues in deployment
 * @param relativePath Relative path to resolve
 * @param baseUrl Base URL for ESM imports
 * @returns Resolved absolute path
 */
export function resolveDeploymentPath(relativePath: string, baseUrl?: string): string {
  try {
    // In ESM, we can use import.meta.url
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const url = new URL(relativePath, baseUrl || import.meta.url);
      return url.pathname;
    }
  } catch (e) {
    // Ignore errors, fall back to relative path
  }
  
  // In CommonJS, we use a different approach
  try {
    // @ts-ignore
    const path = require('path');
    // @ts-ignore
    const __dirname = path.dirname(require.main?.filename || '.');
    return path.resolve(__dirname, relativePath);
  } catch (e) {
    // Last resort: return the original path
    return relativePath;
  }
}

/**
 * Create a build-independent dynamically loadable module
 * This is useful for modules that need conditional loading based on environment
 * @param modulePath Path to the module 
 */
export async function loadCompatibleModule<T>(modulePath: string): Promise<T | null> {
  try {
    // Try ESM import first
    // We can't directly check for 'import' existence, so we'll just try the import
    return (await import(modulePath)) as T;
  } catch (e) {
    console.warn(`ESM import failed for ${modulePath}:`, e);
  }
  
  try {
    // Fallback to CommonJS
    // @ts-ignore
    return require(modulePath) as T;
  } catch (e) {
    console.error(`CJS require failed for ${modulePath}:`, e);
    return null;
  }
}

/**
 * Register error handlers for improved debugging in production
 */
export function registerDeploymentErrorHandlers(): void {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    
    // Handle module format errors specifically
    if (err.message?.includes('import.meta') || 
        err.message?.includes('require is not defined')) {
      console.error('Module format error detected - check if your code is compatible with the current environment');
    }
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

/**
 * Log detailed information about the deployment environment
 * Useful for debugging deployment issues
 */
export function logDeploymentInfo(): void {
  const info = detectModuleFormat();
  
  console.log('===== Deployment Information =====');
  console.log(`Module Format: ${info.format}`);
  console.log(`Environment: ${info.environment}`);
  console.log(`Node Version: ${info.nodeVersion}`);
  console.log(`Build Time: ${info.buildTime}`);
  console.log('==================================');
}

// Export functions in a way that's compatible with both ESM and CommonJS
export const deploymentHelper = createDualExport({
  detectModuleFormat,
  resolveDeploymentPath,
  loadCompatibleModule,
  registerDeploymentErrorHandlers,
  logDeploymentInfo
});