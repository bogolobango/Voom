/**
 * Centralized error handling utilities for API routes
 * Enhanced with deployment compatibility features
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { safeAwait } from './module-compat';
import { deploymentHelper } from './deployment-adapter';

// Standard API error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: any;

  constructor(statusCode: number, message: string, isOperational = true, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    
    // Capture stack trace only in non-production environments or for non-operational errors
    if (process.env.NODE_ENV !== 'production' || !isOperational) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Common error types
export const BadRequestError = (message: string, code?: string, details?: any) => 
  new ApiError(400, message, true, code, details);
export const UnauthorizedError = (message = 'Unauthorized', code?: string) => 
  new ApiError(401, message, true, code);
export const ForbiddenError = (message = 'Forbidden', code?: string) => 
  new ApiError(403, message, true, code);
export const NotFoundError = (message = 'Resource not found', code?: string) => 
  new ApiError(404, message, true, code);
export const ConflictError = (message: string, code?: string, details?: any) => 
  new ApiError(409, message, true, code, details);
export const ServerError = (message = 'Internal server error', code?: string, details?: any) => 
  new ApiError(500, message, false, code, details);

// Error for module format compatibility issues
export const ModuleFormatError = (message: string, details?: any) => 
  new ApiError(500, `Module format compatibility error: ${message}`, false, 'MODULE_FORMAT_ERROR', details);

// Async handler to remove try/catch boilerplate
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Format validation errors from Zod
export const handleZodError = (error: ZodError) => {
  const validationError = fromZodError(error);
  return BadRequestError(validationError.message, 'VALIDATION_ERROR', error.errors);
};

// Handle module format compatibility errors
export const handleModuleFormatError = (error: Error) => {
  // Detect common module format issues
  const message = error.message || '';
  
  if (message.includes('import.meta') || message.includes('top-level await')) {
    return ModuleFormatError('ESM features used in CJS context', { originalError: error.message });
  }
  
  if (message.includes('Cannot use import statement outside a module')) {
    return ModuleFormatError('ES Module import in CommonJS context', { originalError: error.message });
  }
  
  if (message.includes('require is not defined')) {
    return ModuleFormatError('CommonJS require in ESM context', { originalError: error.message });
  }
  
  return ServerError(`Unexpected module error: ${message}`, 'UNKNOWN_MODULE_ERROR');
};

// Global error handler middleware with improved diagnostics for deployment
export const errorMiddleware = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  // Check if it's a Zod validation error
  if (err instanceof ZodError) {
    const formattedError = handleZodError(err);
    return res.status(formattedError.statusCode).json({
      status: 'error',
      message: formattedError.message,
      code: formattedError.code || 'VALIDATION_ERROR',
      errors: err.errors
    });
  }

  // Get error details with defaults
  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Something went wrong';
  const code = (err as ApiError).code || (statusCode === 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR');
  const isOperational = (err as ApiError).isOperational !== undefined 
    ? (err as ApiError).isOperational 
    : statusCode < 500;
  const details = (err as ApiError).details;

  // Enhanced logging for debugging
  if (!isOperational) {
    console.error(`Non-operational error [${code}]:`, err);
    
    // In production, log deployment information for serious errors
    if (process.env.NODE_ENV === 'production') {
      try {
        const moduleInfo = deploymentHelper.detectModuleFormat();
        console.error('Deployment context:', moduleInfo);
      } catch (e) {
        console.error('Could not detect module format:', e);
      }
    }
  }

  // Send appropriate response
  res.status(statusCode).json({
    status: 'error',
    message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};