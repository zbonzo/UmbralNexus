export interface GameConfig {
  hostName: string;
  playerCap: number;
  difficulty: 'normal' | 'hard' | 'nightmare';
}

export interface Player {
  playerId: string;
  name: string;
  class: 'warrior' | 'ranger' | 'mage' | 'cleric';
  level: number;
  health: number;
  maxHealth: number;
  position: {
    floor: number;
    x: number;
    y: number;
  };
  actionPoints: number;
  abilities: Ability[];
  nexusEchoes: NexusEcho[];
  inventory: Item[];
  joinedAt: Date;
}

export interface Ability {
  id: string;
  name: string;
  cost: number;
  cooldown: number;
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
  players: Player[];
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