import { z } from 'zod';

// Player action base schema
export const basePlayerActionSchema = z.object({
  playerId: z.string().uuid(),
  timestamp: z.number().optional(),
});

// Movement action schema
export const moveActionSchema = basePlayerActionSchema.extend({
  action: z.literal('MOVE'),
  direction: z.enum(['up', 'down', 'left', 'right']),
});

// Ability action schema
export const abilityActionSchema = basePlayerActionSchema.extend({
  action: z.literal('USE_ABILITY'),
  abilityId: z.string().min(1),
  targetId: z.string().optional(), // Optional for self-targeting abilities
  targetPosition: z.object({
    x: z.number().int(),
    y: z.number().int(),
  }).optional(), // Optional for position-targeting abilities
});

// Ready status schema
export const readyActionSchema = basePlayerActionSchema.extend({
  action: z.literal('SET_READY'),
  ready: z.boolean(),
});

// Chat message schema
export const chatActionSchema = basePlayerActionSchema.extend({
  action: z.literal('CHAT'),
  message: z.string().min(1).max(200),
});

// Emote action schema
export const emoteActionSchema = basePlayerActionSchema.extend({
  action: z.literal('EMOTE'),
  emoteId: z.string().min(1),
});

// Union of all player actions
export const playerActionSchema = z.discriminatedUnion('action', [
  moveActionSchema,
  abilityActionSchema,
  readyActionSchema,
  chatActionSchema,
  emoteActionSchema,
]);

// Game joining/leaving schemas
export const joinGameSchema = z.object({
  gameCode: z.string().length(6).regex(/^[A-Z0-9]{6}$/),
  playerName: z.string().min(1).max(50),
});

export const leaveGameSchema = z.object({
  playerId: z.string().uuid(),
});

// Character selection schema
export const characterSelectSchema = z.object({
  playerId: z.string().uuid(),
  characterClass: z.enum(['warrior', 'ranger', 'mage', 'cleric']),
});

// Validation functions
export const validatePlayerAction = (data: unknown) => playerActionSchema.parse(data);
export const validateJoinGame = (data: unknown) => joinGameSchema.parse(data);
export const validateLeaveGame = (data: unknown) => leaveGameSchema.parse(data);
export const validateCharacterSelect = (data: unknown) => characterSelectSchema.parse(data);

// Safe validation functions
export const safeValidatePlayerAction = (data: unknown) => playerActionSchema.safeParse(data);
export const safeValidateJoinGame = (data: unknown) => joinGameSchema.safeParse(data);
export const safeValidateLeaveGame = (data: unknown) => leaveGameSchema.safeParse(data);
export const safeValidateCharacterSelect = (data: unknown) => characterSelectSchema.safeParse(data);