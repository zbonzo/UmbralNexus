import type { Position, Direction } from '../types/game';

/**
 * Calculates the distance between two positions on the game grid.
 * 
 * **WARNING**: Currently uses Manhattan distance which is incorrect for hex grids.
 * Hex grids require special distance calculation based on the coordinate system:
 * - Offset coordinates (odd-q or even-q)
 * - Axial coordinates (q, r)
 * - Cubic coordinates (x, y, z where x + y + z = 0)
 * 
 * @param pos1 - First position on the grid
 * @param pos2 - Second position on the grid
 * @returns Manhattan distance (should be hex distance for proper pathfinding)
 * 
 * @todo Implement proper hex grid distance calculation
 * @see https://www.redblobgames.com/grids/hexagons/#distances
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Calculates the straight-line Euclidean distance between two positions.
 * 
 * Useful for:
 * - Range checks for ranged abilities
 * - Line-of-sight calculations
 * - Visual effects and animations
 * 
 * Note: For movement costs on a hex grid, use hex distance instead.
 * 
 * @param pos1 - First position
 * @param pos2 - Second position  
 * @returns Euclidean distance (straight line)
 */
export function calculateEuclideanDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the new position after moving in a cardinal direction.
 * 
 * **WARNING**: This assumes a square grid. Hex grids have 6 directions:
 * - For flat-top hexes: NE, E, SE, SW, W, NW
 * - For pointy-top hexes: N, NE, SE, S, SW, NW
 * 
 * The offset depends on whether the current row/column is odd or even.
 * 
 * @param currentPos - Starting position
 * @param direction - Cardinal direction to move (up/down/left/right)
 * @param distance - Number of tiles to move (default: 1)
 * @returns New position after movement
 * 
 * @todo Update for hex grid movement with 6 directions
 */
export function getNewPosition(
  currentPos: Position,
  direction: Direction,
  distance: number = 1
): Position {
  const newPos = { ...currentPos };
  
  switch (direction) {
    case 'up':
      newPos.y -= distance;
      break;
    case 'down':
      newPos.y += distance;
      break;
    case 'left':
      newPos.x -= distance;
      break;
    case 'right':
      newPos.x += distance;
      break;
  }
  
  return newPos;
}

/**
 * Check if two positions are the same
 * @param pos1 First position
 * @param pos2 Second position
 * @returns True if positions are identical
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y && pos1.floor === pos2.floor;
}

/**
 * Check if a position is within a rectangular area
 * @param position Position to check
 * @param topLeft Top-left corner of area
 * @param bottomRight Bottom-right corner of area
 * @returns True if position is within area
 */
export function isPositionInArea(
  position: Position,
  topLeft: Position,
  bottomRight: Position
): boolean {
  return (
    position.x >= topLeft.x &&
    position.x <= bottomRight.x &&
    position.y >= topLeft.y &&
    position.y <= bottomRight.y
  );
}

/**
 * Gets all positions within a certain range of a center position.
 * 
 * Creates a diamond-shaped area (Manhattan distance) which is incorrect
 * for hex grids. Hex grids should create a hexagonal area.
 * 
 * Used for:
 * - Area-of-effect abilities
 * - Movement range visualization
 * - Fog of war calculations
 * 
 * @param center - Center position of the area
 * @param range - Maximum distance from center
 * @returns Array of all positions within range
 * 
 * @example
 * ```ts
 * // Get all tiles within 3 moves of player
 * const moveOptions = getPositionsInRange(player.position, 3);
 * ```
 * 
 * @todo Implement hex range calculation for proper hexagonal areas
 */
export function getPositionsInRange(center: Position, range: number): Position[] {
  const positions: Position[] = [];
  
  for (let x = center.x - range; x <= center.x + range; x++) {
    for (let y = center.y - range; y <= center.y + range; y++) {
      const pos: Position = { x, y, floor: center.floor };
      if (calculateDistance(center, pos) <= range) {
        positions.push(pos);
      }
    }
  }
  
  return positions;
}

/**
 * Gets all orthogonally adjacent positions (4-directional: N, S, E, W).
 * 
 * **WARNING**: Hex grids have 6 neighbors, not 4!
 * The neighbors depend on the coordinate system and whether
 * the hex is in an odd or even row/column.
 * 
 * @param position - Center position
 * @returns Array of 4 adjacent positions (should be 6 for hex)
 * 
 * @todo Implement getHexNeighbors() for proper hex adjacency
 */
export function getAdjacentPositions(position: Position): Position[] {
  return [
    { x: position.x, y: position.y - 1, floor: position.floor }, // up
    { x: position.x, y: position.y + 1, floor: position.floor }, // down
    { x: position.x - 1, y: position.y, floor: position.floor }, // left
    { x: position.x + 1, y: position.y, floor: position.floor }, // right
  ];
}

/**
 * Gets all adjacent positions including diagonals (8-directional).
 * 
 * **WARNING**: This is for square grids. Hex grids don't have
 * diagonal neighbors - they have exactly 6 neighbors.
 * 
 * Currently used for:
 * - Explosion/splash damage (which might want a larger area)
 * - Line of sight checks
 * 
 * @param position - Center position
 * @returns Array of 8 adjacent positions
 * 
 * @deprecated Use getHexNeighbors() once implemented
 */
export function getAllAdjacentPositions(position: Position): Position[] {
  const positions: Position[] = [];
  
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip center position
      
      positions.push({
        x: position.x + dx,
        y: position.y + dy,
        floor: position.floor,
      });
    }
  }
  
  return positions;
}

/**
 * Check if a position is valid (within bounds)
 * @param position Position to check
 * @param minX Minimum X coordinate
 * @param maxX Maximum X coordinate
 * @param minY Minimum Y coordinate
 * @param maxY Maximum Y coordinate
 * @returns True if position is within bounds
 */
export function isValidPosition(
  position: Position,
  minX: number = 0,
  maxX: number = 100,
  minY: number = 0,
  maxY: number = 100
): boolean {
  return (
    position.x >= minX &&
    position.x <= maxX &&
    position.y >= minY &&
    position.y <= maxY
  );
}

/**
 * Determines the best cardinal direction to move from one position toward another.
 * 
 * Uses simple comparison of X/Y differences. For hex grids, this should
 * consider the 6 hex directions and pick the one that reduces distance most.
 * 
 * Used by:
 * - AI pathfinding for simple movement
 * - Player auto-movement
 * - Projectile direction
 * 
 * @param from - Starting position
 * @param to - Target position
 * @returns Best cardinal direction, or null if already at target
 * 
 * @example
 * ```ts
 * // Enemy moves toward player
 * const direction = getDirectionTo(enemy.position, player.position);
 * if (direction) enemy.move(direction);
 * ```
 */
export function getDirectionTo(from: Position, to: Position): Direction | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // If positions are the same
  if (dx === 0 && dy === 0) {
    return null;
  }
  
  // Determine primary direction based on larger difference
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

/**
 * Generates a simple straight-line path between two positions.
 * 
 * **IMPORTANT**: This is NOT A* pathfinding! It doesn't avoid obstacles
 * or consider movement costs. It simply steps toward the target.
 * 
 * Current uses:
 * - Line-of-sight checks
 * - Projectile paths
 * - Visual indicators
 * 
 * For actual pathfinding with obstacle avoidance, implement A* algorithm
 * with hex grid heuristics.
 * 
 * @param from - Starting position
 * @param to - Target position
 * @returns Array of positions forming a direct path
 * 
 * @todo Implement proper A* pathfinding for hex grids
 */
export function generateSimplePath(from: Position, to: Position): Position[] {
  const path: Position[] = [];
  const current = { ...from };
  
  while (!positionsEqual(current, to)) {
    const direction = getDirectionTo(current, to);
    if (!direction) break;
    
    current.x = getNewPosition(current, direction).x;
    current.y = getNewPosition(current, direction).y;
    path.push({ ...current });
  }
  
  return path;
}