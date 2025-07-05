import type { Position, Tile } from '../types/game';
import { calculateDistance, positionsEqual } from './coordinateUtils';

/**
 * Calculate visibility range for a character class
 * @param characterClass Character class
 * @param level Character level
 * @returns Visibility range in tiles
 */
export function getVisibilityRange(characterClass: string, level: number): number {
  const baseRange: Record<string, number> = {
    warrior: 3,  // Short range, focused on close combat
    ranger: 5,   // Long range, scouting ability
    mage: 4,     // Medium range
    cleric: 4,   // Medium range
  };
  
  const base = baseRange[characterClass] || 3;
  
  // Increase by 1 every 5 levels
  const levelBonus = Math.floor(level / 5);
  
  return base + levelBonus;
}

/**
 * Calculate which tiles are visible from a position using simple radius
 * @param position Observer position
 * @param range Visibility range
 * @param mapWidth Map width in tiles
 * @param mapHeight Map height in tiles
 * @returns Array of visible positions
 */
export function calculateVisibleTiles(
  position: Position,
  range: number,
  mapWidth: number,
  mapHeight: number
): Position[] {
  const visibleTiles: Position[] = [];
  
  for (let x = Math.max(0, position.x - range); x <= Math.min(mapWidth - 1, position.x + range); x++) {
    for (let y = Math.max(0, position.y - range); y <= Math.min(mapHeight - 1, position.y + range); y++) {
      const tilePos: Position = { x, y, floor: position.floor };
      
      if (calculateDistance(position, tilePos) <= range) {
        visibleTiles.push(tilePos);
      }
    }
  }
  
  return visibleTiles;
}

/**
 * Check if there's line of sight between two positions
 * @param from Starting position
 * @param to Target position
 * @param tiles Map tiles (2D array)
 * @returns True if there's line of sight
 */
export function hasLineOfSight(
  from: Position,
  to: Position,
  tiles: Tile[][]
): boolean {
  // Simple line-of-sight using Bresenham's line algorithm
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;
  let err = dx - dy;
  
  let x = from.x;
  let y = from.y;
  
  while (true) {
    // Check if current position is a wall (blocks line of sight)
    if (tiles.length > 0 && x >= 0 && x < (tiles[0]?.length || 0) && y >= 0 && y < tiles.length) {
      if (tiles[y]?.[x]?.type === 'wall') {
        return false;
      }
    }
    
    // Reached target
    if (x === to.x && y === to.y) {
      return true;
    }
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/**
 * Calculate which tiles are visible using line of sight
 * @param position Observer position
 * @param range Visibility range
 * @param tiles Map tiles
 * @returns Array of visible positions
 */
export function calculateLineOfSightVisibility(
  position: Position,
  range: number,
  tiles: Tile[][]
): Position[] {
  const visibleTiles: Position[] = [];
  const mapHeight = tiles.length;
  const mapWidth = tiles[0]?.length || 0;
  
  // Get all tiles in range
  const tilesInRange = calculateVisibleTiles(position, range, mapWidth, mapHeight);
  
  // Filter by line of sight
  for (const tile of tilesInRange) {
    if (hasLineOfSight(position, tile, tiles)) {
      visibleTiles.push(tile);
    }
  }
  
  return visibleTiles;
}

/**
 * Update visibility for a player's movement
 * @param playerPosition New player position
 * @param characterClass Player's character class
 * @param level Player's level
 * @param tiles Current map tiles
 * @returns Updated tiles with visibility information
 */
export function updatePlayerVisibility(
  playerPosition: Position,
  characterClass: string,
  level: number,
  tiles: Tile[][]
): Tile[][] {
  const range = getVisibilityRange(characterClass, level);
  const visiblePositions = calculateLineOfSightVisibility(playerPosition, range, tiles);
  
  // Create a copy of tiles to avoid mutation
  const updatedTiles = tiles.map(row => row.map(tile => ({ ...tile })));
  
  // Mark visible tiles
  for (const pos of visiblePositions) {
    if (pos.y >= 0 && pos.y < updatedTiles.length && 
        pos.x >= 0 && pos.x < updatedTiles[pos.y]!.length) {
      updatedTiles[pos.y]![pos.x]!.isVisible = true;
      updatedTiles[pos.y]![pos.x]!.isExplored = true;
    }
  }
  
  // Hide tiles that are no longer visible but keep them explored
  for (let y = 0; y < updatedTiles.length; y++) {
    for (let x = 0; x < updatedTiles[y]!.length; x++) {
      const tilePos: Position = { x, y, floor: playerPosition.floor };
      const isCurrentlyVisible = visiblePositions.some(pos => positionsEqual(pos, tilePos));
      
      if (!isCurrentlyVisible) {
        updatedTiles[y]![x]!.isVisible = false;
      }
    }
  }
  
  return updatedTiles;
}

/**
 * Check if a position is visible to any player in a group
 * @param position Position to check
 * @param playerPositions Array of player positions
 * @param characterClasses Array of character classes (same order as positions)
 * @param levels Array of player levels (same order as positions)
 * @param tiles Map tiles
 * @returns True if position is visible to any player
 */
export function isVisibleToAnyPlayer(
  position: Position,
  playerPositions: Position[],
  characterClasses: string[],
  levels: number[],
  tiles: Tile[][]
): boolean {
  for (let i = 0; i < playerPositions.length; i++) {
    const playerPos = playerPositions[i]!;
    const characterClass = characterClasses[i]!;
    const level = levels[i]!;
    
    const range = getVisibilityRange(characterClass, level);
    
    if (calculateDistance(playerPos, position) <= range &&
        hasLineOfSight(playerPos, position, tiles)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get shared visibility for a group of players (union of all visible areas)
 * @param playerPositions Array of player positions
 * @param characterClasses Array of character classes
 * @param levels Array of player levels
 * @param tiles Map tiles
 * @returns Array of positions visible to at least one player
 */
export function getSharedVisibility(
  playerPositions: Position[],
  characterClasses: string[],
  levels: number[],
  tiles: Tile[][]
): Position[] {
  const allVisibleTiles = new Set<string>();
  
  for (let i = 0; i < playerPositions.length; i++) {
    const range = getVisibilityRange(characterClasses[i]!, levels[i]!);
    const visibleTiles = calculateLineOfSightVisibility(playerPositions[i]!, range, tiles);
    
    for (const tile of visibleTiles) {
      allVisibleTiles.add(`${tile.x},${tile.y},${tile.floor || 0}`);
    }
  }
  
  // Convert back to Position objects
  return Array.from(allVisibleTiles).map(key => {
    const parts = key.split(',');
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    const floor = Number(parts[2]);
    return { x, y, floor };
  });
}