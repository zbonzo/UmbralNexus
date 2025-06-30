import { z } from 'zod';

// Game creation schema
export const createGameSchema = z.object({
  name: z.string().min(1).max(50),
  playerCap: z.number().int().min(1).max(20),
  endConditions: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('TIME_LIMIT'),
      value: z.number().int().min(300).max(7200), // 5 min to 2 hours
    }),
    z.object({
      type: z.literal('DEATH_COUNT'),
      value: z.number().int().min(1).max(100),
    }),
    z.object({
      type: z.literal('FLOOR_COUNT'),
      value: z.number().int().min(5).max(50),
    }),
  ]),
  difficulty: z.enum(['normal', 'hard', 'nightmare']).optional().default('normal'),
});

// Player join schema
export const joinGameSchema = z.object({
  gameId: z.string().length(6),
  playerName: z.string().min(1).max(20),
  characterClass: z.enum(['warrior', 'ranger', 'mage', 'cleric']),
});

// Player action schema
export const playerActionSchema = z.object({
  playerId: z.string().uuid(),
  action: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('MOVE'),
      targetPosition: z.object({
        x: z.number().int(),
        y: z.number().int(),
      }),
    }),
    z.object({
      type: z.literal('ATTACK'),
      targetId: z.string().uuid(),
      abilityId: z.string(),
    }),
    z.object({
      type: z.literal('USE_ABILITY'),
      abilityId: z.string(),
      targetPosition: z.object({
        x: z.number().int(),
        y: z.number().int(),
      }).optional(),
      targetId: z.string().uuid().optional(),
    }),
    z.object({
      type: z.literal('USE_ITEM'),
      itemId: z.string(),
      targetId: z.string().uuid().optional(),
    }),
    z.object({
      type: z.literal('END_TURN'),
    }),
  ]),
});

// WebSocket message schemas
export const clientMessageSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
  timestamp: z.number(),
  messageId: z.string(),
});

export const serverMessageSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
  timestamp: z.number(),
  messageId: z.string().optional(),
});

// Export types
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
export type PlayerActionInput = z.infer<typeof playerActionSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;