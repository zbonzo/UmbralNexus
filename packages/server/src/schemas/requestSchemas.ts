/**
 * Centralized request validation schemas using Zod.
 * Provides consistent validation across all API endpoints.
 */

import { z } from 'zod';
import { GAME_CONFIG_CONSTANTS } from '@umbral-nexus/shared';

/**
 * Schema for game creation requests.
 * Validates all required fields for creating a new game.
 */
export const createGameRequestSchema = z.object({
  name: z.string()
    .min(GAME_CONFIG_CONSTANTS.MIN_NAME_LENGTH, 'Game name is required')
    .max(GAME_CONFIG_CONSTANTS.MAX_GAME_NAME_LENGTH, `Game name cannot exceed ${GAME_CONFIG_CONSTANTS.MAX_GAME_NAME_LENGTH} characters`),
  
  hostId: z.string()
    .min(1, 'Host ID is required'),
  
  hostName: z.string()
    .min(GAME_CONFIG_CONSTANTS.MIN_NAME_LENGTH, 'Host name is required')
    .max(GAME_CONFIG_CONSTANTS.MAX_PLAYER_NAME_LENGTH, `Host name cannot exceed ${GAME_CONFIG_CONSTANTS.MAX_PLAYER_NAME_LENGTH} characters`),
  
  playerCap: z.number()
    .int('Player cap must be an integer')
    .min(GAME_CONFIG_CONSTANTS.MIN_PLAYERS, `Minimum ${GAME_CONFIG_CONSTANTS.MIN_PLAYERS} player`)
    .max(GAME_CONFIG_CONSTANTS.MAX_PLAYERS, `Maximum ${GAME_CONFIG_CONSTANTS.MAX_PLAYERS} players`),
  
  difficulty: z.enum(['normal', 'hard', 'nightmare'], {
    errorMap: () => ({ message: 'Difficulty must be normal, hard, or nightmare' })
  }),
  
  endConditions: z.object({
    type: z.enum(['TIME_LIMIT', 'DEATH_COUNT', 'FLOOR_COUNT'], {
      errorMap: () => ({ message: 'End condition type must be TIME_LIMIT, DEATH_COUNT, or FLOOR_COUNT' })
    }),
    value: z.number()
      .int('End condition value must be an integer')
      .min(1, 'End condition value must be positive')
  })
});

/**
 * Schema for joining a game.
 * Validates player information for game joining.
 */
export const joinGameRequestSchema = z.object({
  playerId: z.string()
    .min(1, 'Player ID is required'),
  
  name: z.string()
    .min(GAME_CONFIG_CONSTANTS.MIN_NAME_LENGTH, 'Player name is required')
    .max(GAME_CONFIG_CONSTANTS.MAX_PLAYER_NAME_LENGTH, `Player name cannot exceed ${GAME_CONFIG_CONSTANTS.MAX_PLAYER_NAME_LENGTH} characters`),
  
  class: z.enum(['warrior', 'ranger', 'mage', 'cleric'], {
    errorMap: () => ({ message: 'Character class must be warrior, ranger, mage, or cleric' })
  }).optional()
});

/**
 * Schema for game ID validation in URL parameters.
 */
export const gameIdParamSchema = z.object({
  gameId: z.string()
    .length(GAME_CONFIG_CONSTANTS.GAME_ID_LENGTH, `Game ID must be exactly ${GAME_CONFIG_CONSTANTS.GAME_ID_LENGTH} characters`)
    .regex(/^[A-Z0-9]+$/, 'Game ID must contain only uppercase letters and numbers')
});

/**
 * Schema for starting a game.
 * Validates host authorization.
 */
export const startGameRequestSchema = z.object({
  hostId: z.string()
    .min(1, 'Host ID is required')
});

/**
 * Schema for leaving a game.
 * Validates player identification.
 */
export const leaveGameRequestSchema = z.object({
  playerId: z.string()
    .min(1, 'Player ID is required')
});

/**
 * Schema for player actions in WebSocket messages.
 * Validates real-time game actions.
 */
export const playerActionSchema = z.object({
  playerId: z.string()
    .min(1, 'Player ID is required'),
  
  gameId: z.string()
    .length(GAME_CONFIG_CONSTANTS.GAME_ID_LENGTH, `Game ID must be exactly ${GAME_CONFIG_CONSTANTS.GAME_ID_LENGTH} characters`),
  
  payload: z.union([
    // Movement action
    z.object({
      type: z.literal('MOVE_TO'),
      targetPosition: z.object({
        x: z.number().int('X coordinate must be an integer'),
        y: z.number().int('Y coordinate must be an integer'),
        floor: z.number().int('Floor must be an integer').optional()
      })
    }),
    
    // Target setting action
    z.object({
      type: z.literal('SET_TARGET'),
      targetId: z.string().nullable(),
      targetType: z.enum(['player', 'enemy']).optional()
    }),
    
    // Ability usage
    z.object({
      type: z.literal('USE_ABILITY'),
      abilityId: z.string().min(1, 'Ability ID is required'),
      targetId: z.string().optional(),
      targetPosition: z.object({
        x: z.number().int(),
        y: z.number().int(),
        floor: z.number().int().optional()
      }).optional()
    }),
    
    // Item usage
    z.object({
      type: z.literal('USE_ITEM'),
      itemId: z.string().min(1, 'Item ID is required')
    }),
    
    // Stop movement
    z.object({
      type: z.literal('STOP_MOVING')
    })
  ])
});

/**
 * Schema for chat messages (for future implementation).
 */
export const chatMessageSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  gameId: z.string().length(GAME_CONFIG_CONSTANTS.GAME_ID_LENGTH),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(200, 'Message cannot exceed 200 characters')
});

/**
 * Type exports for TypeScript inference.
 */
export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type JoinGameRequest = z.infer<typeof joinGameRequestSchema>;
export type GameIdParam = z.infer<typeof gameIdParamSchema>;
export type StartGameRequest = z.infer<typeof startGameRequestSchema>;
export type LeaveGameRequest = z.infer<typeof leaveGameRequestSchema>;
export type PlayerAction = z.infer<typeof playerActionSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;