// Hex grid generation utilities
import type { HexCoordinate } from './hexCoordinates';
import { createHexCoordinate } from './hexCoordinates';

// Get all hexes within a certain distance
export const hexesInRange = (center: HexCoordinate, range: number): HexCoordinate[] => {
  const results: HexCoordinate[] = [];
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    
    for (let r = r1; r <= r2; r++) {
      results.push(createHexCoordinate(center.q + q, center.r + r));
    }
  }
  
  return results;
};

// Generate a hex grid of specified radius (creates hexagonal shape)
export const generateHexGrid = (radius: number): HexCoordinate[] => {
  const hexes: HexCoordinate[] = [];
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    
    for (let r = r1; r <= r2; r++) {
      hexes.push(createHexCoordinate(q, r));
    }
  }
  
  return hexes;
};

// Generate a square hex grid (fills a square area)
export const generateSquareHexGrid = (radius: number): HexCoordinate[] => {
  const hexes: HexCoordinate[] = [];
  
  // For a square grid, we want all coordinates where:
  // -radius <= q <= radius and -radius <= r <= radius
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      hexes.push(createHexCoordinate(q, r));
    }
  }
  
  return hexes;
};

// Generate a rectangular hex grid (for testing or specific layouts)
export const generateRectangularHexGrid = (width: number, height: number): HexCoordinate[] => {
  const hexes: HexCoordinate[] = [];
  
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      // Offset for proper rectangular grid
      const offset = Math.floor(q / 2);
      hexes.push(createHexCoordinate(q, r - offset));
    }
  }
  
  return hexes;
};
