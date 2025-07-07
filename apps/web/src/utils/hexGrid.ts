// Hex grid coordinate system utilities
// Using cube coordinates (q, r, s) as primary with axial (q, r) as secondary
// Designed for FLAT-TOP hexagons (horizontal orientation)

// Cube coordinates: q + r + s = 0 (constraint for valid hex coordinates)

// Extend Window interface for debugging
declare global {
  interface Window {
    debugLoggedNeighbors?: boolean;
  }
}
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

// Simple mathematical distance for hexagons (Manhattan distance in hex space)
export const hexManhattanDistance = (start: HexCoordinate, target: HexCoordinate): number => {
  return (Math.abs(start.q - target.q) + Math.abs(start.q + start.r - target.q - target.r) + Math.abs(start.r - target.r)) / 2;
};

// Check if this grid is actually using a different connectivity pattern
export const analyzeGridPattern = (): void => {
  const origin = createHexCoordinate(0, 0);
  console.log('=== ANALYZING GRID CONNECTIVITY PATTERN ===');
  
  // Test what the actual neighbors are
  const testCoords = [
    // All possible distance 1 candidates
    createHexCoordinate(-1, -1),
    createHexCoordinate(-1, 0),
    createHexCoordinate(-1, 1),
    createHexCoordinate(0, -1),
    createHexCoordinate(0, 1),
    createHexCoordinate(1, -1),
    createHexCoordinate(1, 0),
    createHexCoordinate(1, 1),
  ];
  
  console.log('Testing which coordinates are actually distance 1:');
  testCoords.forEach(coord => {
    const dist = hexDistance(origin, coord);
    const isNeighbor = hexNeighbors(origin).some(n => hexEquals(n, coord));
    console.log(`(${coord.q},${coord.r}): distance=${dist}, isNeighbor=${isNeighbor}`);
  });
};

// Calculate distance between two hex coordinates using BFS (breadth-first search)
export const hexDistance = (start: HexCoordinate, target: HexCoordinate): number => {
  if (hexEquals(start, target)) return 0;
  
  // First, let's test if it's a direct neighbor
  const isDirectNeighbor = hexNeighbors(start).some(n => hexEquals(n, target));
  if (isDirectNeighbor) return 1;
  
  // Debug specific case - northwest neighbor
  const isDebugCase = start.q === 0 && start.r === 0 && start.s === 0 && 
                     target.q === -1 && target.r === 1 && target.s === 0;
  
  if (isDebugCase) {
    console.log(`=== BFS DEBUG: Finding distance from (${start.q},${start.r}) to (${target.q},${target.r}) ===`);
    console.log(`Is direct neighbor? ${isDirectNeighbor}`);
    console.log(`Mathematical distance: ${hexManhattanDistance(start, target)}`);
  }
  
  const visited = new Set<string>();
  const queue: { coord: HexCoordinate; distance: number }[] = [{ coord: start, distance: 0 }];
  visited.add(hexToKey(start));
  
  let iteration = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    iteration++;
    
    if (isDebugCase) {
      console.log(`Iteration ${iteration}: Processing (${current.coord.q},${current.coord.r}) at distance ${current.distance}`);
    }
    
    // Check all neighbors
    const neighbors = hexNeighbors(current.coord);
    for (const neighbor of neighbors) {
      const key = hexToKey(neighbor);
      
      if (isDebugCase) {
        console.log(`  - Checking neighbor: (${neighbor.q},${neighbor.r})`);
        console.log(`  - Is target? ${hexEquals(neighbor, target)}`);
        console.log(`  - Already visited? ${visited.has(key)}`);
      }
      
      if (hexEquals(neighbor, target)) {
        if (isDebugCase) console.log(`✓ Found target! Distance: ${current.distance + 1}`);
        return current.distance + 1;
      }
      
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ coord: neighbor, distance: current.distance + 1 });
        if (isDebugCase) {
          console.log(`  - Added to queue at distance ${current.distance + 1}`);
        }
      }
    }
    
    // Prevent infinite search
    if (current.distance > 20) {
      if (isDebugCase) console.log(`Breaking search - exceeded max distance`);
      break;
    }
  }
  
  // If we can't reach the target, return a large number
  if (isDebugCase) console.log(`✗ Could not reach target!`);
  return 999;
};

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

// Check if hex coordinates are equal
export const hexEquals = (a: HexCoordinate, b: HexCoordinate): boolean => {
  const result = a.q === b.q && a.r === b.r && a.s === b.s;
  
  // Debug specific case
  if ((a.q === 0 && a.r === 0 && a.s === 0) || (b.q === 0 && b.r === 0 && b.s === 0)) {
    if ((a.q === -1 && a.r === -1 && a.s === 2) || (b.q === -1 && b.r === -1 && b.s === 2)) {
      console.log(`hexEquals: comparing (${a.q},${a.r},${a.s}) with (${b.q},${b.r},${b.s}) = ${result}`);
    }
  }
  
  return result;
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

// Convert old square coordinates to hex (for migration)
export const squareToHex = (x: number, y: number): HexCoordinate => {
  // Simple conversion - you might want to adjust this based on your needs
  const q = x;
  const r = y - Math.floor(x / 2);
  return createHexCoordinate(q, r);
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
  const [q, r] = parts as [number, number]; // Type assertion after validation
  return createHexCoordinate(q, r);
};

// Get hex coordinate from axial for backward compatibility
export const axialToHexCoordinate = (q: number, r: number): HexCoordinate => {
  return createHexCoordinate(q, r);
};

// =============================================================================
// HEX TILE TYPES AND INTERFACES
// =============================================================================

// Base tile types that can exist on the hex grid
export type BaseTileType = 'floor' | 'wall' | 'pit' | 'door' | 'stairs';

// Entity types that can occupy tiles
export type EntityType = 'player' | 'enemy' | 'chest' | 'trap' | 'item' | 'obstacle';

// Tile occupancy rules - defines what can coexist on a tile
export interface TileOccupancyRules {
  allowsMultipleEntities: boolean;
  allowsMovement: boolean;
  blocksVision: boolean;
  allowedEntityTypes: EntityType[];
}

// Individual entity on a tile
export interface TileEntity {
  id: string;
  type: EntityType;
  data?: Record<string, unknown>; // Additional entity-specific data
}

// Core hex tile interface
export interface HexTile {
  coordinate: HexCoordinate;
  baseType: BaseTileType;
  entities: TileEntity[];
  occupancyRules: TileOccupancyRules;
  metadata?: Record<string, unknown>; // Additional tile-specific data
}

// Predefined occupancy rules for common tile types
export const TILE_OCCUPANCY_RULES: Record<BaseTileType, TileOccupancyRules> = {
  floor: {
    allowsMultipleEntities: false, // Only one entity per floor tile
    allowsMovement: true,
    blocksVision: false,
    allowedEntityTypes: ['player', 'enemy', 'chest', 'trap', 'item']
  },
  wall: {
    allowsMultipleEntities: false,
    allowsMovement: false,
    blocksVision: true,
    allowedEntityTypes: [] // Walls don't allow entities
  },
  pit: {
    allowsMultipleEntities: false,
    allowsMovement: false, // Can't move into pits
    blocksVision: false,
    allowedEntityTypes: [] // Nothing can occupy pits
  },
  door: {
    allowsMultipleEntities: false,
    allowsMovement: true, // Doors can be moved through
    blocksVision: false,
    allowedEntityTypes: ['player', 'enemy']
  },
  stairs: {
    allowsMultipleEntities: false,
    allowsMovement: true,
    blocksVision: false,
    allowedEntityTypes: ['player', 'enemy']
  }
};

// Factory function to create a hex tile
export const createHexTile = (
  coordinate: HexCoordinate,
  baseType: BaseTileType,
  entities: TileEntity[] = [],
  metadata?: Record<string, unknown>
): HexTile => {
  const occupancyRules = TILE_OCCUPANCY_RULES[baseType];
  
  // Validate entities against occupancy rules
  const validEntities = entities.filter(entity => 
    occupancyRules.allowedEntityTypes.includes(entity.type)
  );

  if (validEntities.length > 1 && !occupancyRules.allowsMultipleEntities) {
    throw new Error(`Tile type '${baseType}' does not allow multiple entities`);
  }

  return {
    coordinate,
    baseType,
    entities: validEntities,
    occupancyRules,
    metadata
  };
};

// Helper functions for working with hex tiles
export const canMoveToTile = (tile: HexTile): boolean => {
  return tile.occupancyRules.allowsMovement && 
         (tile.entities.length === 0 || tile.occupancyRules.allowsMultipleEntities);
};

export const canPlaceEntity = (tile: HexTile, entityType: EntityType): boolean => {
  return tile.occupancyRules.allowedEntityTypes.includes(entityType) &&
         (tile.entities.length === 0 || tile.occupancyRules.allowsMultipleEntities);
};

export const getEntitiesOfType = (tile: HexTile, entityType: EntityType): TileEntity[] => {
  return tile.entities.filter(entity => entity.type === entityType);
};

export const hasEntity = (tile: HexTile, entityType: EntityType): boolean => {
  return tile.entities.some(entity => entity.type === entityType);
};

export const addEntityToTile = (tile: HexTile, entity: TileEntity): HexTile => {
  if (!canPlaceEntity(tile, entity.type)) {
    throw new Error(`Cannot place ${entity.type} on ${tile.baseType} tile`);
  }

  return {
    ...tile,
    entities: [...tile.entities, entity]
  };
};

export const removeEntityFromTile = (tile: HexTile, entityId: string): HexTile => {
  return {
    ...tile,
    entities: tile.entities.filter(entity => entity.id !== entityId)
  };
};

// =============================================================================
// HEX MAP DATA STRUCTURE
// =============================================================================

// Map data structure for efficient hex grid storage and lookup
export class HexMap {
  private tiles: Map<string, HexTile> = new Map();

  // Get tile at specific coordinate
  getTile(coordinate: HexCoordinate): HexTile | undefined {
    return this.tiles.get(hexToKey(coordinate));
  }

  // Set tile at specific coordinate
  setTile(tile: HexTile): void {
    this.tiles.set(hexToKey(tile.coordinate), tile);
  }

  // Check if tile exists at coordinate
  hasTile(coordinate: HexCoordinate): boolean {
    return this.tiles.has(hexToKey(coordinate));
  }

  // Remove tile at coordinate
  removeTile(coordinate: HexCoordinate): boolean {
    return this.tiles.delete(hexToKey(coordinate));
  }

  // Get all tiles
  getAllTiles(): HexTile[] {
    return Array.from(this.tiles.values());
  }

  // Get tiles within range of a coordinate
  getTilesInRange(center: HexCoordinate, range: number): HexTile[] {
    const coordinates = hexesInRange(center, range);
    return coordinates
      .map(coord => this.getTile(coord))
      .filter((tile): tile is HexTile => tile !== undefined);
  }

  // Get neighbors of a tile
  getTileNeighbors(coordinate: HexCoordinate): HexTile[] {
    const neighbors = hexNeighbors(coordinate);
    return neighbors
      .map(coord => this.getTile(coord))
      .filter((tile): tile is HexTile => tile !== undefined);
  }

  // Clear all tiles
  clear(): void {
    this.tiles.clear();
  }

  // Get map size
  size(): number {
    return this.tiles.size;
  }
}