/**
 * Utilities for creating consistent API responses and handling errors.
 * Centralizes response formatting to ensure consistency across all endpoints.
 */

import type { Response } from 'express';
import { ZodError } from 'zod';

/**
 * Creates a standardized error response object.
 * 
 * @param code - Error code (e.g., 'VALIDATION_ERROR', 'GAME_NOT_FOUND')
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Additional error details (e.g., validation errors)
 * @returns Standardized error response object
 */
export function createErrorResponse(
  code: string, 
  message: string, 
  statusCode: number = 400, 
  details?: any
) {
  return {
    success: false,
    error: { 
      code, 
      message, 
      ...(details && { details })
    }
  };
}

/**
 * Creates a standardized success response object.
 * 
 * @param data - Response data
 * @param message - Optional success message
 * @returns Standardized success response object
 */
export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Sends a validation error response with 400 status code.
 * 
 * @param res - Express response object
 * @param message - Validation error message
 * @param details - Additional validation details
 */
export function sendValidationError(res: Response, message: string, details?: any): void {
  res.status(400).json(createErrorResponse('VALIDATION_ERROR', message, 400, details));
}

/**
 * Sends a formatted Zod validation error response.
 * 
 * @param res - Express response object
 * @param zodError - Zod validation error
 * @param message - Custom error message (default: 'Invalid input')
 */
export function sendZodError(res: Response, zodError: ZodError, message: string = 'Invalid input'): void {
  res.status(400).json(createErrorResponse('VALIDATION_ERROR', message, 400, zodError.errors));
}

/**
 * Sends a rate limiting error response with 429 status code.
 * 
 * @param res - Express response object
 * @param windowMs - Rate limit window in milliseconds
 */
export function sendRateLimitError(res: Response, windowMs: number): void {
  res.status(429).json({
    ...createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.', 429),
    retryAfter: Math.ceil(windowMs / 1000)
  });
}

/**
 * Handles game-related errors with appropriate status codes and messages.
 * Maps common game error patterns to proper HTTP responses.
 * 
 * @param error - Error object
 * @param res - Express response object
 */
export function handleGameError(error: Error, res: Response): void {
  const message = error.message;
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  
  // Map error messages to appropriate status codes
  if (message.includes('not found')) {
    statusCode = 404;
    code = 'GAME_NOT_FOUND';
  } else if (message.includes('full')) {
    statusCode = 409;
    code = 'GAME_FULL';
  } else if (message.includes('already in game')) {
    statusCode = 409;
    code = 'PLAYER_EXISTS';
  } else if (message.includes('Only the host')) {
    statusCode = 403;
    code = 'NOT_HOST';
  } else if (message.includes('invalid') || message.includes('Invalid')) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }
  
  res.status(statusCode).json(createErrorResponse(code, message, statusCode));
}

/**
 * Sends a success response with game data.
 * 
 * @param res - Express response object
 * @param gameData - Game data to return
 * @param message - Optional success message
 */
export function sendGameSuccess(res: Response, gameData: any, message?: string): void {
  res.status(200).json(createSuccessResponse(gameData, message));
}

/**
 * Sends a 404 not found response for games.
 * 
 * @param res - Express response object
 * @param gameId - Game ID that wasn't found
 */
export function sendGameNotFound(res: Response, gameId?: string): void {
  const message = gameId ? `Game ${gameId} not found` : 'Game not found';
  res.status(404).json(createErrorResponse('GAME_NOT_FOUND', message, 404));
}

/**
 * Common error response types for consistency
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  PLAYER_EXISTS: 'PLAYER_EXISTS',
  NOT_HOST: 'NOT_HOST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN'
} as const;