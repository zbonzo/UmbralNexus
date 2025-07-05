import { z } from 'zod';

// Base schemas
export const positionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  floor: z.number().int().min(1).optional(),
});

export const abilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  cost: z.number().int().min(1).max(10),
  cooldown: z.number().int().min(0),
  description: z.string().optional(),
});

export const nexusEchoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  type: z.enum(['offensive', 'defensive', 'utility', 'legendary']),
});

export const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  type: z.string().min(1),
  effects: z.array(z.any()),
});

// Game configuration schema
export const gameConfigSchema = z.object({
  hostName: z.string().min(1).max(50),
  playerCap: z.number().int().min(1).max(20),
  difficulty: z.enum(['normal', 'hard', 'nightmare']),
});

// Player schema
export const playerSchema = z.object({
  playerId: z.string().uuid(),
  name: z.string().min(1).max(50),
  class: z.enum(['warrior', 'ranger', 'mage', 'cleric']),
  level: z.number().int().min(1).max(100),
  health: z.number().int().min(0),
  maxHealth: z.number().int().min(1),
  position: positionSchema,
  actionPoints: z.number().int().min(0).max(10),
  abilities: z.array(abilitySchema),
  nexusEchoes: z.array(nexusEchoSchema),
  inventory: z.array(itemSchema),
  joinedAt: z.date(),
});

// Game state schema
export const gameStateSchema = z.object({
  gameId: z.string().min(6).max(6), // 6-character game ID
  players: z.array(playerSchema),
  currentPhase: z.enum(['lobby', 'active', 'victory', 'defeat']),
  currentFloor: z.number().int().min(1),
  startTime: z.number().optional(),
});

// Game error schema
export const gameErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.any().optional(),
});

// Validation functions
export const validateGameConfig = (data: unknown) => gameConfigSchema.parse(data);
export const validatePlayer = (data: unknown) => playerSchema.parse(data);
export const validateGameState = (data: unknown) => gameStateSchema.parse(data);
export const validateGameError = (data: unknown) => gameErrorSchema.parse(data);

// Safe validation functions (return result objects)
export const safeValidateGameConfig = (data: unknown) => gameConfigSchema.safeParse(data);
export const safeValidatePlayer = (data: unknown) => playerSchema.safeParse(data);
export const safeValidateGameState = (data: unknown) => gameStateSchema.safeParse(data);
export const safeValidateGameError = (data: unknown) => gameErrorSchema.safeParse(data);