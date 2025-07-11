// Hex to pixel conversion utilities for rendering
import type { HexCoordinate } from './hexCoordinates';
import { createHexCoordinate } from './hexCoordinates';

// Convert hex coordinates to pixel position for CSS positioning (FLAT-TOP hexagon)
export const hexToPixel = (hex: HexCoordinate, hexSize: number): { x: number; y: number } => {
  // For flat-top hexagons:
  // x = size * (3/2 * q)
  // y = size * (sqrt(3)/2 * q + sqrt(3) * r)
  const x = hexSize * (3/2 * hex.q);
  const y = hexSize * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
};

// Convert pixel position back to hex coordinates (for click handling, FLAT-TOP)
export const pixelToHex = (x: number, y: number, hexSize: number): HexCoordinate => {
  // For flat-top hexagons:
  // q = (2/3 * x) / size
  // r = (-1/3 * x + sqrt(3)/3 * y) / size
  const q = (2/3 * x) / hexSize;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
  
  // Round to nearest hex
  return hexRound(createHexCoordinate(q, r));
};

// Round fractional hex coordinates to nearest integer hex
export const hexRound = (hex: HexCoordinate): HexCoordinate => {
  let rq = Math.round(hex.q);
  let rr = Math.round(hex.r);
  let rs = Math.round(hex.s);
  
  const qDiff = Math.abs(rq - hex.q);
  const rDiff = Math.abs(rr - hex.r);
  const sDiff = Math.abs(rs - hex.s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }
  
  return { q: rq, r: rr, s: rs };
};
