// Re-export comprehensive game constants
export * from './gameConstants';

export const CHARACTER_STATS = {
  warrior: {
    baseHealth: 120,
    baseDamage: 15,
    baseDefense: 5,
    moveRange: 3,
  },
  ranger: {
    baseHealth: 80,
    baseDamage: 12,
    baseDefense: 2,
    moveRange: 4,
  },
  mage: {
    baseHealth: 60,
    baseDamage: 18,
    baseDefense: 1,
    moveRange: 3,
  },
  cleric: {
    baseHealth: 100,
    baseDamage: 10,
    baseDefense: 3,
    moveRange: 3,
  },
} as const;

export const FLOOR_DIMENSIONS = {
  MIN_WIDTH: 20,
  MAX_WIDTH: 50,
  MIN_HEIGHT: 20,
  MAX_HEIGHT: 50,
  MIN_ROOMS: 5,
  MAX_ROOMS: 15,
} as const;

export const WEBSOCKET_EVENTS = {
  // Client -> Server
  JOIN_GAME: 'JOIN_GAME',
  LEAVE_GAME: 'LEAVE_GAME',
  PLAYER_ACTION: 'PLAYER_ACTION',
  HEARTBEAT: 'HEARTBEAT',
  
  // Server -> Client
  GAME_STATE: 'GAME_STATE',
  GAME_UPDATE: 'GAME_UPDATE',
  ERROR: 'ERROR',
  ACKNOWLEDGMENT: 'ACKNOWLEDGMENT',
} as const;