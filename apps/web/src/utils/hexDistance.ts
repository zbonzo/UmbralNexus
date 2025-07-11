// Distance calculation functions for hex coordinates
import type { HexCoordinate } from './hexCoordinates';
import { createHexCoordinate, hexEquals, hexToKey } from './hexCoordinates';
import { hexNeighbors } from './hexNeighbors';
import type { HexMap } from './hexTiles';

// Simple mathematical distance for hexagons (Manhattan distance in hex space)
export const hexManhattanDistance = (start: HexCoordinate, target: HexCoordinate): number => {
  return (Math.abs(start.q - target.q) + Math.abs(start.q + start.r - target.q - target.r) + Math.abs(start.r - target.r)) / 2;
};

// Calculate straight-line distance (as the crow flies)
// This ignores all obstacles and just counts the minimum hex steps
export const hexStraightDistance = (start: HexCoordinate, target: HexCoordinate): number => {
  if (hexEquals(start, target)) return 0;
  
  // Use the standard hex distance formula
  const dq = target.q - start.q;
  const dr = target.r - start.r;
  const ds = target.s - start.s;
  
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
};

// Check if there's line of sight between two hexes (can't go through walls)
export const hasLineOfSight = (start: HexCoordinate, target: HexCoordinate, hexMap: HexMap): boolean => {
  if (hexEquals(start, target)) return true;
  
  // Use Bresenham-like algorithm to trace a line through hex grid
  const distance = hexStraightDistance(start, target);
  
  for (let i = 1; i < distance; i++) {
    const t = i / distance;
    // Interpolate position
    const q = Math.round(start.q + (target.q - start.q) * t);
    const r = Math.round(start.r + (target.r - start.r) * t);
    const hex = createHexCoordinate(q, r);
    
    const tile = hexMap.getTile(hex);
    if (!tile || tile.baseType === 'wall') {
      return false; // Hit a wall
    }
  }
  
  return true;
};

// Calculate walking distance between two hex coordinates using BFS (breadth-first search)
// This version respects walls and obstacles - for movement
export const hexWalkingDistance = (start: HexCoordinate, target: HexCoordinate, hexMap?: HexMap): number => {
  if (hexEquals(start, target)) return 0;
  
  const visited = new Set<string>();
  const queue: { coord: HexCoordinate; distance: number }[] = [{ coord: start, distance: 0 }];
  visited.add(hexToKey(start));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check all neighbors
    const neighbors = hexNeighbors(current.coord);
    for (const neighbor of neighbors) {
      const key = hexToKey(neighbor);
      
      // Skip if already visited
      if (visited.has(key)) continue;
      
      // If we have a map, check if the tile is walkable
      if (hexMap) {
        const tile = hexMap.getTile(neighbor);
        // Skip if tile doesn't exist or is a wall
        if (!tile || tile.baseType === 'wall') continue;
      }
      
      if (hexEquals(neighbor, target)) {
        return current.distance + 1;
      }
      
      visited.add(key);
      queue.push({ coord: neighbor, distance: current.distance + 1 });
    }
    
    // Prevent infinite search
    if (current.distance > 50) break;
  }
  
  // If we can't reach the target, return a large number
  return 999;
};

// Calculate ranged distance (for spells/arrows)
// Can go over obstacles but not through walls
export const hexRangedDistance = (start: HexCoordinate, target: HexCoordinate, hexMap: HexMap): number => {
  // First check if we have line of sight
  if (!hasLineOfSight(start, target, hexMap)) {
    return 999; // Can't reach through walls
  }
  
  // If we have line of sight, return straight distance
  return hexStraightDistance(start, target);
};

// Backward compatibility - use walking distance by default
export const hexDistance = hexWalkingDistance;
