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
  code?: string;
  details?: any;

  constructor(statusCode: number, message: string, isOperational = true, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    if (process.env.NODE_ENV !== 'production' || !isOperational) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

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

// Global error handler middleware
export const errorMiddleware = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const formattedError = handleZodError(err);
    return res.status(formattedError.statusCode).json({
      status: 'error',
      message: formattedError.message,
      code: formattedError.code || 'VALIDATION_ERROR',
      errors: err.errors
    });
  }

  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Something went wrong';
  const code = (err as ApiError).code || (statusCode === 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR');
  const isOperational = (err as ApiError).isOperational !== undefined
    ? (err as ApiError).isOperational
    : statusCode < 500;
  const details = (err as ApiError).details;

  if (!isOperational) {
    console.error(`Non-operational error [${code}]:`, err);
  }

  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal server error' : message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
