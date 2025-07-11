// Hex neighbor and direction utilities
import type { HexCoordinate } from './hexCoordinates';
import { createHexCoordinate, hexEquals } from './hexCoordinates';

// Extend Window interface for debugging
declare global {
  interface Window {
    debugLoggedNeighbors?: boolean;
  }
}

// Directions depend on whether the column (q) is even or odd
// For even columns (including 0), use one set of directions
export const HEX_DIRECTIONS_EVEN: HexCoordinate[] = [
  createHexCoordinate(0, 1),   // North
  createHexCoordinate(1, 1),   // Northeast
  createHexCoordinate(1, 0),   // East
  createHexCoordinate(0, -1),  // South
  createHexCoordinate(-1, 0),  // West
  createHexCoordinate(-1, 1)   // Northwest
];

// For odd columns, use a different set
export const HEX_DIRECTIONS_ODD: HexCoordinate[] = [
  createHexCoordinate(0, 1),   // North
  createHexCoordinate(1, 0),   // Northeast
  createHexCoordinate(1, -1),  // Southeast
  createHexCoordinate(0, -1),  // South
  createHexCoordinate(-1, -1), // Southwest
  createHexCoordinate(-1, 0)   // Northwest
];

// Keep the old one for compatibility
export const HEX_DIRECTIONS = HEX_DIRECTIONS_EVEN;

// Direction names for UI
export const HEX_DIRECTION_NAMES = [
  'north',
  'northeast', 
  'east',
  'south',
  'west',
  'northwest'
] as const;

// Get neighbor hex in a specific direction
export const hexNeighbor = (hex: HexCoordinate, direction: number): HexCoordinate => {
  const dir = HEX_DIRECTIONS[direction];
  if (!dir) {
    throw new Error(`Invalid direction index: ${direction}. Must be 0-5.`);
  }
  return createHexCoordinate(hex.q + dir.q, hex.r + dir.r);
};

// Get all neighbors of a hex - uses different directions for even/odd columns
export const hexNeighbors = (hex: HexCoordinate): HexCoordinate[] => {
  // Choose directions based on whether the column is even or odd
  const directions = (hex.q % 2 === 0) ? HEX_DIRECTIONS_EVEN : HEX_DIRECTIONS_ODD;
  
  const neighbors = directions.map(dir => 
    createHexCoordinate(hex.q + dir.q, hex.r + dir.r)
  );
  
  // Debug log for (0,0) - but only once per page load
  if (hex.q === 0 && hex.r === 0 && hex.s === 0) {
    if (typeof window !== 'undefined' && !window.debugLoggedNeighbors) {
      console.log('Neighbors of (0,0):', neighbors.map(n => `(${n.q},${n.r})`));
      // Test specific target
      const target = createHexCoordinate(-1, 1);
      console.log(`Target (-1,1): constructed as (${target.q},${target.r})`);
      console.log(`Is (-1,1) in neighbors?`, neighbors.some(n => hexEquals(n, target)));
      window.debugLoggedNeighbors = true;
    }
  }
  
  return neighbors;
};

// Debug: Check if two hexes are neighbors
export const areNeighbors = (a: HexCoordinate, b: HexCoordinate): boolean => {
  const neighbors = hexNeighbors(a);
  return neighbors.some(neighbor => hexEquals(neighbor, b));
};
