/**
 * Centralized error handling utilities for API routes
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Standard API error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const BadRequestError = (message: string) => new ApiError(400, message);
export const UnauthorizedError = (message = 'Unauthorized') => new ApiError(401, message);
export const ForbiddenError = (message = 'Forbidden') => new ApiError(403, message);
export const NotFoundError = (message = 'Resource not found') => new ApiError(404, message);
export const ConflictError = (message: string) => new ApiError(409, message);
export const ServerError = (message = 'Internal server error') => new ApiError(500, message, false);

// Async handler to remove try/catch boilerplate
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Format validation errors from Zod
export const handleZodError = (error: ZodError) => {
  const validationError = fromZodError(error);
  return BadRequestError(validationError.message);
};

// Global error handler middleware
export const errorMiddleware = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const formattedError = handleZodError(err);
    return res.status(formattedError.statusCode).json({
      status: 'error',
      message: formattedError.message,
      errors: err.errors
    });
  }

  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Something went wrong';
  const isOperational = (err as ApiError).isOperational !== undefined 
    ? (err as ApiError).isOperational 
    : statusCode < 500;

  // Log non-operational errors for debugging
  if (!isOperational) {
    console.error('Non-operational error:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};