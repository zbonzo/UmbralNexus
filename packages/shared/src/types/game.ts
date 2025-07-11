export interface GameConfig {
  playerCap: number;
  difficulty: 'normal' | 'hard' | 'nightmare';
  endConditions: {
    type: 'TIME_LIMIT' | 'DEATH_COUNT' | 'FLOOR_COUNT';
    value: number;
  };
}

export interface Player {
  playerId: string;
  name: string;
  class: 'warrior' | 'ranger' | 'mage' | 'cleric';
  level: number;
  health: number;
  maxHealth: number;
  actionPoints: number; // Current action points
  position: {
    floor: number;
    x: number;
    y: number;
  };
  targetPosition?: {
    x: number;
    y: number;
  };
  velocity?: {
    x: number;
    y: number;
  };
  moveSpeed: number; // Units per second
  targetId?: string; // Current target (player or enemy)
  abilities: Ability[];
  abilityCooldowns: Record<string, number>; // abilityId -> cooldown end timestamp
  nexusEchoes: NexusEcho[];
  inventory: Item[];
  joinedAt: Date;
}

export interface Ability {
  id: string;
  name: string;
  range: number; // Range in grid units
  cooldownTime: number; // Cooldown in milliseconds
  cost: number; // Action points cost
  cooldown: number; // Current cooldown remaining
  damageOrHeal?: number;
  targetType: 'enemy' | 'ally' | 'self' | 'ground';
  areaOfEffect?: number; // Radius for AoE abilities
  description?: string;
}

export interface NexusEcho {
  id: string;
  name: string;
  description: string;
  type: 'offensive' | 'defensive' | 'utility' | 'legendary';
}

export interface Item {
  id: string;
  name: string;
  type: string;
  effects: any[];
}

export interface GameState {
  gameId: string;
  name: string;
  host: string;
  config: GameConfig;
  players: Player[];
  floors: Floor[];
  currentPhase: 'lobby' | 'active' | 'victory' | 'defeat';
  currentFloor: number;
  startTime?: number;
}

export interface GameError {
  code: string;
  message: string;
  details?: any;
}

export interface Floor {
  id: number;
  tiles: Tile[][];
  enemies: Enemy[];
  items: Item[];
  stairsUp?: Position;
  stairsDown?: Position;
}

export interface Tile {
  type: 'floor' | 'wall' | 'door' | 'stairs';
  isVisible: boolean;
  isExplored: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  type: string;
  health: number;
  maxHealth: number;
  position: Position;
  abilities: Ability[];
}

export interface Position {
  x: number;
  y: number;
  floor?: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type CharacterClass = 'warrior' | 'ranger' | 'mage' | 'cleric';

export interface CharacterClassData {
  id: string;
  name: string;
  icon: string;
  description: string;
  health: number;
  abilities: Array<{
    id: string;
    name: string;
    cost: number;
    description?: string;
  }>;
}

// Player actions
export interface PlayerAction {
  type: 'MOVE_TO' | 'SET_TARGET' | 'USE_ABILITY' | 'USE_ITEM' | 'STOP_MOVING';
  playerId: string;
  timestamp: number;
}

export interface MoveToAction extends PlayerAction {
  type: 'MOVE_TO';
  targetPosition: {
    x: number;
    y: number;
  };
}

export interface SetTargetAction extends PlayerAction {
  type: 'SET_TARGET';
  targetId: string | null; // null to clear target
  targetType: 'player' | 'enemy';
}

export interface AbilityAction extends PlayerAction {
  type: 'USE_ABILITY';
  abilityId: string;
  targetId?: string;
  targetPosition?: Position;
}

export interface StopMovingAction extends PlayerAction {
  type: 'STOP_MOVING';
}

export interface ItemAction extends PlayerAction {
  type: 'USE_ITEM';
  itemId: string;
}