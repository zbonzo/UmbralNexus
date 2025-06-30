import { Position } from '../types';

/**
 * Calculate Manhattan distance between two positions
 */
export function calculateDistance(from: Position, to: Position): number {
  if (from.floor !== to.floor) {
    return Infinity; // Can't move between floors directly
  }
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

/**
 * Check if two positions are adjacent (including diagonally)
 */
export function areAdjacent(pos1: Position, pos2: Position): boolean {
  if (pos1.floor !== pos2.floor) return false;
  
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  
  return dx <= 1 && dy <= 1 && (dx + dy) > 0;
}

/**
 * Generate a random game ID
 */
export function generateGameId(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Calculate damage with modifiers
 */
export function calculateDamage(
  baseDamage: number,
  attackerLevel: number,
  defenderDefense: number,
  modifiers: { multiplier?: number; flat?: number } = {}
): number {
  const levelBonus = 1 + (attackerLevel * 0.1);
  const damage = baseDamage * levelBonus * (modifiers.multiplier || 1) + (modifiers.flat || 0);
  const reducedDamage = Math.max(1, damage - defenderDefense);
  
  return Math.floor(reducedDamage);
}

/**
 * Check if a position is within bounds
 */
export function isInBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Get all positions within a given range
 */
export function getPositionsInRange(center: Position, range: number): Position[] {
  const positions: Position[] = [];
  
  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (Math.abs(dx) + Math.abs(dy) <= range) {
        positions.push({
          floor: center.floor,
          x: center.x + dx,
          y: center.y + dy,
        });
      }
    }
  }
  
  return positions;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}