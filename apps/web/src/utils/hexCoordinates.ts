// Hex coordinate system and mathematical operations
// Using cube coordinates (q, r, s) as primary with axial (q, r) as secondary
// Designed for FLAT-TOP hexagons (horizontal orientation)

// Cube coordinates: q + r + s = 0 (constraint for valid hex coordinates)

export interface HexCoordinate {
  q: number; // Column axis (east-west)
  r: number; // Row axis (diagonal northeast-southwest)
  s: number; // Computed axis (diagonal northwest-southeast), always equals -(q + r)
}

// Axial coordinates - more compact representation
export interface AxialCoordinate {
  q: number; // Column
  r: number; // Row
}

// Legacy cube coordinate interface for backward compatibility
export interface CubeCoordinate {
  x: number;
  y: number;
  z: number;
}

// Create a hex coordinate with proper cube constraint
export const createHexCoordinate = (q: number, r: number): HexCoordinate => {
  return { q, r, s: -(q + r) };
};

// Convert axial coordinates to full hex coordinates
export const axialToHex = (axial: AxialCoordinate): HexCoordinate => {
  return createHexCoordinate(axial.q, axial.r);
};

// Convert hex coordinates to axial (for compact storage)
export const hexToAxial = (hex: HexCoordinate): AxialCoordinate => {
  return { q: hex.q, r: hex.r };
};

// Legacy conversion functions for backward compatibility
export const axialToCube = (axial: AxialCoordinate): CubeCoordinate => {
  const x = axial.q;
  const z = axial.r;
  const y = -x - z;
  return { x, y, z };
};

export const cubeToAxial = (cube: CubeCoordinate): AxialCoordinate => {
  return { q: cube.x, r: cube.z };
};

// Validate hex coordinate has proper cube constraint
export const isValidHexCoordinate = (hex: HexCoordinate): boolean => {
  return Math.abs(hex.q + hex.r + hex.s) < 1e-10; // Account for floating point precision
};

// Check if hex coordinates are equal
export const hexEquals = (a: HexCoordinate, b: HexCoordinate): boolean => {
  return a.q === b.q && a.r === b.r && a.s === b.s;
};

// Create a coordinate key for Map storage
export const hexToKey = (hex: HexCoordinate): string => {
  return `${hex.q},${hex.r}`;
};

// Parse a coordinate key back to hex coordinate
export const keyToHex = (key: string): HexCoordinate => {
  const parts = key.split(',').map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) {
    throw new Error(`Invalid coordinate key format: ${key}. Expected 'q,r' format.`);
  }
  const [q, r] = parts as [number, number];
  return createHexCoordinate(q, r);
};

// Get hex coordinate from axial for backward compatibility
export const axialToHexCoordinate = (q: number, r: number): HexCoordinate => {
  return createHexCoordinate(q, r);
};

// Convert old square coordinates to hex (for migration)
export const squareToHex = (x: number, y: number): HexCoordinate => {
  const q = x;
  const r = y - Math.floor(x / 2);
  return createHexCoordinate(q, r);
};
