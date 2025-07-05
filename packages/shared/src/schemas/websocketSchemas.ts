import { z } from 'zod';

// Base message schema
export const baseMessageSchema = z.object({
  type: z.string().min(1),
  payload: z.any(),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

// Client-to-server message schemas
export const createGameMessageSchema = z.object({
  type: z.literal('CREATE_GAME'),
  payload: z.object({
    hostName: z.string().min(1).max(50),
    playerCap: z.number().int().min(1).max(20),
    difficulty: z.enum(['normal', 'hard', 'nightmare']),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const joinGameMessageSchema = z.object({
  type: z.literal('JOIN_GAME'),
  payload: z.object({
    gameCode: z.string().length(6),
    playerName: z.string().min(1).max(50),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const leaveGameMessageSchema = z.object({
  type: z.literal('LEAVE_GAME'),
  payload: z.object({}),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const playerActionMessageSchema = z.object({
  type: z.literal('PLAYER_ACTION'),
  payload: z.object({
    action: z.enum(['MOVE', 'USE_ABILITY', 'SET_READY', 'CHAT', 'EMOTE']),
    direction: z.enum(['up', 'down', 'left', 'right']).optional(),
    abilityId: z.string().optional(),
    targetId: z.string().optional(),
    targetPosition: z.object({
      x: z.number().int(),
      y: z.number().int(),
    }).optional(),
    ready: z.boolean().optional(),
    message: z.string().max(200).optional(),
    emoteId: z.string().optional(),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const playerReadyMessageSchema = z.object({
  type: z.literal('PLAYER_READY'),
  payload: z.object({
    ready: z.boolean(),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const heartbeatMessageSchema = z.object({
  type: z.literal('HEARTBEAT'),
  payload: z.object({}),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

// Server-to-client message schemas
export const gameCreatedMessageSchema = z.object({
  type: z.literal('GAME_CREATED'),
  payload: z.object({
    gameId: z.string().length(6),
    hostId: z.string().uuid(),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const gameStateUpdateMessageSchema = z.object({
  type: z.literal('GAME_STATE_UPDATE'),
  payload: z.object({
    gameId: z.string(),
    players: z.array(z.any()), // Would use playerSchema but avoiding circular deps
    currentPhase: z.enum(['lobby', 'active', 'victory', 'defeat']),
    currentFloor: z.number().int().min(1),
    startTime: z.number().optional(),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const playerJoinedMessageSchema = z.object({
  type: z.literal('PLAYER_JOINED'),
  payload: z.any(), // Player object
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const playerLeftMessageSchema = z.object({
  type: z.literal('PLAYER_LEFT'),
  payload: z.object({
    playerId: z.string().uuid(),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export const errorMessageSchema = z.object({
  type: z.literal('ERROR'),
  payload: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.any().optional(),
  }),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

// Union schemas for client and server messages
export const clientMessageSchema = z.discriminatedUnion('type', [
  createGameMessageSchema,
  joinGameMessageSchema,
  leaveGameMessageSchema,
  playerActionMessageSchema,
  playerReadyMessageSchema,
  heartbeatMessageSchema,
]);

export const serverMessageSchema = z.discriminatedUnion('type', [
  gameCreatedMessageSchema,
  gameStateUpdateMessageSchema,
  playerJoinedMessageSchema,
  playerLeftMessageSchema,
  errorMessageSchema,
  heartbeatMessageSchema,
]);

// WebSocket connection schemas
export const socketOptionsSchema = z.object({
  queue: z.boolean().optional(),
  timeout: z.number().int().min(1000).max(30000).optional(),
  acknowledgment: z.boolean().optional(),
});

// Validation functions
export const validateClientMessage = (data: unknown) => clientMessageSchema.parse(data);
export const validateServerMessage = (data: unknown) => serverMessageSchema.parse(data);
export const validateSocketOptions = (data: unknown) => socketOptionsSchema.parse(data);

// Safe validation functions
export const safeValidateClientMessage = (data: unknown) => clientMessageSchema.safeParse(data);
export const safeValidateServerMessage = (data: unknown) => serverMessageSchema.safeParse(data);
export const safeValidateSocketOptions = (data: unknown) => socketOptionsSchema.safeParse(data);