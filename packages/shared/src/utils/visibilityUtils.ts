import type { Position, Tile } from '../types/game';
import { calculateDistance, positionsEqual } from './coordinateUtils';
import { CLASS_MODIFIERS, LEVEL_PROGRESSION } from '../constants';

/**
 * Calculates the visibility range for a character class based on their role and level.
 * 
 * Base visibility ranges reflect class roles:
 * - Warrior: 3 tiles (melee focus, limited scouting)
 * - Ranger: 5 tiles (scout role, enhanced vision)
 * - Mage: 4 tiles (balanced magical awareness)
 * - Cleric: 4 tiles (support role needs good awareness)
 * 
 * Level progression: +1 tile every 5 levels to reward advancement
 * 
 * @param characterClass - The player's chosen class
 * @param level - Current character level
 * @returns Visibility range in tiles
 * 
 * @example
 * ```ts
 * getVisibilityRange('ranger', 10); // Returns 7 (5 base + 2 level bonus)
 * ```
 */
export function getVisibilityRange(characterClass: string, level: number): number {
  const base = (CLASS_MODIFIERS.VISIBILITY_RANGE as any)[characterClass] || 
               CLASS_MODIFIERS.VISIBILITY_RANGE.warrior;
  
  // Level bonus
  const levelBonus = Math.floor(level / LEVEL_PROGRESSION.VISIBILITY_BONUS_INTERVAL) * 
                     LEVEL_PROGRESSION.VISIBILITY_BONUS_AMOUNT;
  
  return base + levelBonus;
}

/**
 * Calculates all tiles within visibility range using a simple circular radius.
 * 
 * This function provides basic fog of war by determining which tiles
 * are within the observer's sight range. It doesn't account for obstacles
 * blocking line of sight - use calculateLineOfSightVisibility() for that.
 * 
 * Performance: O(range²) - consider caching for static observers
 * 
 * @param position - Observer's current position
 * @param range - Maximum visibility distance
 * @param mapWidth - Total map width to prevent out-of-bounds
 * @param mapHeight - Total map height to prevent out-of-bounds
 * @returns Array of positions within visibility range
 * 
 * @see calculateLineOfSightVisibility For vision with obstacle blocking
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
 * Determines if there's an unobstructed line of sight between two positions.
 * 
 * Uses Bresenham's line algorithm to trace a path between points,
 * checking each tile for vision-blocking obstacles (walls).
 * 
 * Used for:
 * - Ranged attack validation
 * - Spell targeting
 * - AI target acquisition
 * - Fog of war calculations
 * 
 * @param from - Observer position
 * @param to - Target position to check
 * @param tiles - 2D array of map tiles (tiles[y][x])
 * @returns `true` if path is unobstructed, `false` if blocked
 * 
 * @example
 * ```ts
 * // Can the archer shoot the enemy?
 * if (hasLineOfSight(archer.position, enemy.position, mapTiles)) {
 *   performRangedAttack(archer, enemy);
 * }
 * ```
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
 * Calculates visible tiles considering both range and line-of-sight blocking.
 * 
 * This is the main visibility function for fog of war. It:
 * 1. Gets all tiles within range (circular area)
 * 2. Filters out tiles blocked by walls using raycasting
 * 3. Returns only tiles with clear line of sight
 * 
 * Performance considerations:
 * - O(range² × averageRayLength) complexity
 * - Consider caching results for stationary units
 * - Use spatial partitioning for large maps
 * 
 * @param position - Observer's position
 * @param range - Maximum visibility distance
 * @param tiles - Map tile data including walls
 * @returns Array of positions that are both in range and unobstructed
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
 * Updates the fog of war when a player moves to a new position.
 * 
 * This function manages two visibility states:
 * - `isVisible`: Currently visible to the player (bright)
 * - `isExplored`: Previously seen but not currently visible (dim)
 * 
 * The fog of war has three states:
 * 1. Unexplored (black) - Never seen
 * 2. Explored (dim) - Seen before but not currently visible
 * 3. Visible (bright) - Currently in line of sight
 * 
 * @param playerPosition - Player's new position after movement
 * @param characterClass - Class determines base visibility range
 * @param level - Level provides visibility bonuses
 * @param tiles - Current map state to update
 * @returns New tile array with updated visibility flags
 * 
 * @example
 * ```ts
 * // Update fog of war after player moves
 * const newTiles = updatePlayerVisibility(
 *   player.position,
 *   player.class,
 *   player.level,
 *   currentMapTiles
 * );
 * setMapTiles(newTiles);
 * ```
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
 * Checks if a position is visible to any player in a cooperative group.
 * 
 * Used for shared vision in co-op gameplay where the party shares
 * information. If any player can see a position, it's revealed to all.
 * 
 * Common uses:
 * - Enemy visibility on shared screen
 * - Treasure/secret detection
 * - Trap warnings
 * - Shared minimap updates
 * 
 * @param position - Position to check visibility for
 * @param playerPositions - All player positions in the group
 * @param characterClasses - Classes array (must match playerPositions order)
 * @param levels - Levels array (must match playerPositions order)
 * @param tiles - Map data for line-of-sight checks
 * @returns `true` if ANY player can see the position
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
 * Calculates the union of all players' visible areas for shared vision.
 * 
 * In cooperative gameplay, the party shares vision - if one player
 * sees an area, all players benefit. This creates tactical opportunities
 * for scout classes (Rangers) to reveal areas for the whole party.
 * 
 * Performance optimization using Set for deduplication ensures
 * O(n × m) complexity where n = players and m = average visible tiles.
 * 
 * @param playerPositions - Array of all player positions
 * @param characterClasses - Corresponding character classes
 * @param levels - Corresponding player levels
 * @param tiles - Map tile data
 * @returns Combined array of all positions visible to the party
 * 
 * @example
 * ```ts
 * // Update shared party vision
 * const partyVision = getSharedVisibility(
 *   players.map(p => p.position),
 *   players.map(p => p.class),
 *   players.map(p => p.level),
 *   mapTiles
 * );
 * ```
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