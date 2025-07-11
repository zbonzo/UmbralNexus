/**
 * Reusable validation middleware functions.
 * Eliminates duplicated validation logic across endpoints.
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { 
  sanitizeGameId, 
  sanitizePlayerName, 
  sanitizeGameName,
  isStringSafe,
  RateLimiter 
} from '@umbral-nexus/shared/src/utils/inputSanitization';
import { GAME_CONFIG_CONSTANTS, API_CONSTANTS } from '@umbral-nexus/shared';
import { sendValidationError, sendZodError, sendRateLimitError } from '../utils/responseUtils';

// Rate limiters (singleton instances)
const apiRateLimiter = new RateLimiter(
  API_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  API_CONSTANTS.RATE_LIMIT_WINDOW_MS
);

const wsRateLimiter = new RateLimiter(
  API_CONSTANTS.WS_RATE_LIMIT_MAX_MESSAGES,
  API_CONSTANTS.WS_RATE_LIMIT_WINDOW_MS
);

/**
 * Rate limiting middleware for API endpoints.
 * Prevents DoS attacks and abuse.
 */
export function checkRateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!apiRateLimiter.isAllowed(clientIp)) {
    sendRateLimitError(res, API_CONSTANTS.RATE_LIMIT_WINDOW_MS);
    return;
  }
  
  next();
}

/**
 * Validates and sanitizes game ID from URL parameters.
 * Updates req.params.gameId with sanitized version.
 */
export function validateGameId(req: Request, res: Response, next: NextFunction): void {
  const { gameId } = req.params;
  
  const sanitizedGameId = sanitizeGameId(gameId);
  if (!sanitizedGameId) {
    sendValidationError(res, 'Invalid game ID format. Must be 6 alphanumeric characters.');
    return;
  }
  
  req.params.gameId = sanitizedGameId;
  next();
}

/**
 * Creates a middleware function to validate and sanitize a player name field.
 * 
 * @param fieldName - Name of the field to validate (e.g., 'name', 'hostName')
 * @returns Middleware function
 */
export function validatePlayerName(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const name = req.body[fieldName];
    
    if (!name || typeof name !== 'string') {
      sendValidationError(res, `${fieldName} is required`);
      return;
    }
    
    if (!isStringSafe(name)) {
      sendValidationError(res, `${fieldName} contains invalid characters`);
      return;
    }
    
    req.body[fieldName] = sanitizePlayerName(name);
    
    if (!req.body[fieldName]) {
      sendValidationError(res, `${fieldName} cannot be empty after sanitization`);
      return;
    }
    
    next();
  };
}

/**
 * Validates and sanitizes game name field.
 */
export function validateGameName(req: Request, res: Response, next: NextFunction): void {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string') {
    sendValidationError(res, 'Game name is required');
    return;
  }
  
  if (!isStringSafe(name)) {
    sendValidationError(res, 'Game name contains invalid characters');
    return;
  }
  
  req.body.name = sanitizeGameName(name);
  
  if (!req.body.name) {
    sendValidationError(res, 'Game name cannot be empty after sanitization');
    return;
  }
  
  next();
}

/**
 * Validates player capacity is within allowed limits.
 */
export function validatePlayerCap(req: Request, res: Response, next: NextFunction): void {
  const { playerCap } = req.body;
  
  if (playerCap !== undefined) {
    const cap = Number(playerCap);
    if (!Number.isInteger(cap) || cap < GAME_CONFIG_CONSTANTS.MIN_PLAYERS || cap > GAME_CONFIG_CONSTANTS.MAX_PLAYERS) {
      sendValidationError(res, `Player cap must be between ${GAME_CONFIG_CONSTANTS.MIN_PLAYERS} and ${GAME_CONFIG_CONSTANTS.MAX_PLAYERS}`);
      return;
    }
  }
  
  next();
}

/**
 * Validates character class is one of the allowed values.
 */
export function validateCharacterClass(req: Request, res: Response, next: NextFunction): void {
  const { class: playerClass } = req.body;
  
  if (playerClass && !['warrior', 'ranger', 'mage', 'cleric'].includes(playerClass)) {
    sendValidationError(res, 'Invalid character class. Must be warrior, ranger, mage, or cleric.');
    return;
  }
  
  next();
}

/**
 * Validates difficulty level is one of the allowed values.
 */
export function validateDifficulty(req: Request, res: Response, next: NextFunction): void {
  const { difficulty } = req.body;
  
  if (difficulty && !['normal', 'hard', 'nightmare'].includes(difficulty)) {
    sendValidationError(res, 'Invalid difficulty level. Must be normal, hard, or nightmare.');
    return;
  }
  
  next();
}

/**
 * Creates middleware to validate request body against a Zod schema.
 * 
 * @param schema - Zod schema to validate against
 * @param customMessage - Optional custom error message
 * @returns Middleware function
 */
export function validateSchema(schema: ZodSchema, customMessage?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      sendZodError(res, result.error, customMessage);
      return;
    }
    
    req.body = result.data;
    next();
  };
}

/**
 * Validates that required fields are present and not empty.
 * 
 * @param fields - Array of required field names
 * @returns Middleware function
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const field of fields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        sendValidationError(res, `${field} is required`);
        return;
      }
    }
    next();
  };
}

/**
 * Combines multiple validation middlewares into a single array.
 * Useful for creating validation chains.
 * 
 * @param validators - Array of middleware functions
 * @returns Array of middleware functions
 */
export function createValidationChain(...validators: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return validators;
}

/**
 * WebSocket rate limiter for real-time message limiting.
 * Use this in socket.io event handlers.
 * 
 * @param socket - Socket.io socket object
 * @returns True if message is allowed, false if rate limited
 */
export function checkWebSocketRateLimit(socket: any): boolean {
  const clientIp = socket.request.socket.remoteAddress || 'unknown';
  
  if (!wsRateLimiter.isAllowed(clientIp)) {
    socket.emit('error', { 
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many messages. Please slow down.' 
    });
    return false;
  }
  
  return true;
}