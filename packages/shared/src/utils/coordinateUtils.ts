import type { Position, Direction } from '../types/game';

/**
 * Calculate the distance between two positions
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Manhattan distance between positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Calculate the Euclidean distance between two positions
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Euclidean distance between positions
 */
export function calculateEuclideanDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get the new position after moving in a direction
 * @param currentPos Current position
 * @param direction Direction to move
 * @param distance Distance to move (default: 1)
 * @returns New position after movement
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
 * Get all positions within a certain range of a center position
 * @param center Center position
 * @param range Maximum range (Manhattan distance)
 * @returns Array of positions within range
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
 * Get all adjacent positions (4-directional)
 * @param position Center position
 * @returns Array of adjacent positions
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
 * Get all adjacent positions including diagonals (8-directional)
 * @param position Center position
 * @returns Array of adjacent positions including diagonals
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
 * Get the direction from one position to another
 * @param from Starting position
 * @param to Target position
 * @returns Direction to move (or null if positions are the same)
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
 * Generate a path between two positions (simple line-of-sight)
 * @param from Starting position
 * @param to Target position
 * @returns Array of positions forming a path
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