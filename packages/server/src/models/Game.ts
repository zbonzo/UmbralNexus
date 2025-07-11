import mongoose, { Document, Schema } from 'mongoose';
import type { GameConfig, Player, Floor } from '@umbral-nexus/shared';

export interface IGame extends Document {
  gameId: string;
  name: string;
  host: string;
  config: GameConfig;
  players: Player[];
  floors: Floor[];
  currentPhase: 'lobby' | 'active' | 'victory' | 'defeat';
  startTime?: number;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

const PositionSchema = new Schema({
  floor: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
}, { _id: false });

const StatusEffectSchema = new Schema({
  type: { 
    type: String, 
    enum: ['stunned', 'slowed', 'poisoned', 'burning', 'frozen', 'blessed', 'marked'],
    required: true 
  },
  duration: { type: Number, required: true },
  value: { type: Number },
}, { _id: false });

const AbilitySchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  cooldown: { type: Number, required: true },
  range: { type: Number, required: true },
  damage: { type: Number },
  healing: { type: Number },
  effects: [StatusEffectSchema],
}, { _id: false });

const NexusEchoSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['offensive', 'defensive', 'utility', 'legendary'],
    required: true 
  },
  stackCount: { type: Number, required: true },
  maxStacks: { type: Number, required: true },
}, { _id: false });

const ItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['consumable', 'equipment', 'quest'],
    required: true 
  },
  quantity: { type: Number, required: true },
}, { _id: false });

const PlayerSchema = new Schema({
  playerId: { type: String, required: true },
  name: { type: String, required: true },
  class: { 
    type: String, 
    enum: ['warrior', 'ranger', 'mage', 'cleric'],
    required: true 
  },
  level: { type: Number, required: true, default: 1 },
  health: { type: Number, required: true },
  maxHealth: { type: Number, required: true },
  position: { type: PositionSchema, required: true },
  joinedAt: { type: Date, required: true, default: Date.now },
  abilities: [AbilitySchema],
  nexusEchoes: [NexusEchoSchema],
  inventory: [ItemSchema],
  actionPoints: { type: Number, required: true, default: 3 },
}, { _id: false });

const GameConfigSchema = new Schema({
  playerCap: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 20 
  },
  endConditions: {
    type: {
      type: String,
      enum: ['TIME_LIMIT', 'DEATH_COUNT', 'FLOOR_COUNT'],
      required: true
    },
    value: { type: Number, required: true }
  },
  difficulty: { 
    type: String, 
    enum: ['normal', 'hard', 'nightmare'],
    required: true,
    default: 'normal'
  }
}, { _id: false });

const GameSchema = new Schema<IGame>({
  gameId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  host: { type: String, required: true },
  config: { type: GameConfigSchema, required: true },
  players: [PlayerSchema],
  floors: [{ type: Schema.Types.Mixed }], // Complex floor structure
  currentPhase: { 
    type: String, 
    enum: ['lobby', 'active', 'victory', 'defeat'],
    required: true,
    default: 'lobby'
  },
  startTime: { type: Number },
  endedAt: { type: Date },
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

// Indexes
GameSchema.index({ currentPhase: 1, createdAt: -1 });
GameSchema.index({ 'players.playerId': 1 });
GameSchema.index({ endedAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index

// Instance methods
GameSchema.methods.addPlayer = function(player: Player) {
  if (this.players.length >= this.config.playerCap) {
    throw new Error('Game is full');
  }
  
  if (this.players.find((p: Player) => p.playerId === player.playerId)) {
    throw new Error('Player already in game');
  }
  
  this.players.push(player);
  return this.save();
};

GameSchema.methods.removePlayer = function(playerId: string) {
  this.players = this.players.filter((p: Player) => p.playerId !== playerId);
  return this.save();
};

GameSchema.methods.getPlayer = function(playerId: string) {
  return this.players.find((p: Player) => p.playerId === playerId);
};

export const Game = mongoose.model<IGame>('Game', GameSchema);