export interface Player {
  playerId: string;
  name: string;
  class: CharacterClass;
  level: number;
  health: number;
  maxHealth: number;
  position: Position;
  joinedAt: Date;
  abilities: Ability[];
  nexusEchoes: NexusEcho[];
  inventory: Item[];
  actionPoints: number;
}

export type CharacterClass = 'warrior' | 'ranger' | 'mage' | 'cleric';

export interface Position {
  floor: number;
  x: number;
  y: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  cooldown: number;
  range: number;
  damage?: number;
  healing?: number;
  effects?: StatusEffect[];
}

export interface StatusEffect {
  type: 'stunned' | 'slowed' | 'poisoned' | 'burning' | 'frozen' | 'blessed' | 'marked';
  duration: number;
  value?: number;
}

export interface NexusEcho {
  id: string;
  name: string;
  description: string;
  category: 'offensive' | 'defensive' | 'utility' | 'legendary';
  stackCount: number;
  maxStacks: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'quest';
  quantity: number;
}

export interface GameState {
  id: string;
  config: GameConfig;
  players: Player[];
  floors: Floor[];
  currentPhase: GamePhase;
  startTime: number;
  endConditions: EndConditions;
}

export type GamePhase = 'lobby' | 'active' | 'victory' | 'defeat';

export interface GameConfig {
  playerCap: number;
  endConditions: EndConditions;
  difficulty: 'normal' | 'hard' | 'nightmare';
}

export interface EndConditions {
  type: 'TIME_LIMIT' | 'DEATH_COUNT' | 'FLOOR_COUNT';
  value: number;
}

export interface Floor {
  level: number;
  theme: FloorTheme;
  tiles: Tile[][];
  enemies: Enemy[];
  items: ItemDrop[];
  stairs: Stair[];
  discovered: boolean[][];
}

export type FloorTheme = 'dungeon' | 'cavern' | 'ruins' | 'shadow' | 'nexus';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  passable: boolean;
  occupied?: string; // Entity ID
}

export type TileType = 'floor' | 'wall' | 'door' | 'chest' | 'trap' | 'shrine';

export interface Enemy {
  id: string;
  type: string;
  name: string;
  health: number;
  maxHealth: number;
  position: Position;
  abilities: Ability[];
  loot?: ItemDrop[];
}

export interface ItemDrop {
  itemId: string;
  position: Position;
  quantity: number;
}

export interface Stair {
  position: Position;
  targetFloor: number;
  type: 'up' | 'down';
}