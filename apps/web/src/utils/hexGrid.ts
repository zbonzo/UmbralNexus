// Main hex grid utilities - re-exports from focused modules
// This maintains backward compatibility while allowing better code organization

// Core coordinate types and functions
export type {
  HexCoordinate,
  AxialCoordinate,
  CubeCoordinate
} from './hexCoordinates';

export {
  createHexCoordinate,
  axialToHex,
  hexToAxial,
  axialToCube,
  cubeToAxial,
  isValidHexCoordinate,
  hexEquals,
  hexToKey,
  keyToHex,
  axialToHexCoordinate,
  squareToHex
} from './hexCoordinates';

// Distance calculation functions
export {
  hexManhattanDistance,
  hexStraightDistance,
  hasLineOfSight,
  hexWalkingDistance,
  hexRangedDistance,
  hexDistance
} from './hexDistance';

// Neighbor and direction utilities
export {
  HEX_DIRECTIONS_EVEN,
  HEX_DIRECTIONS_ODD,
  HEX_DIRECTIONS,
  HEX_DIRECTION_NAMES,
  hexNeighbor,
  hexNeighbors,
  areNeighbors
} from './hexNeighbors';

// Pixel conversion utilities
export {
  hexToPixel,
  pixelToHex,
  hexRound
} from './hexPixel';

// Grid generation utilities
export {
  hexesInRange,
  generateHexGrid,
  generateSquareHexGrid,
  generateRectangularHexGrid
} from './hexGeneration';

// Tile types and map data structure
export type {
  BaseTileType,
  EntityType,
  TileOccupancyRules,
  TileEntity,
  HexTile
} from './hexTiles';

export {
  TILE_OCCUPANCY_RULES,
  createHexTile,
  canMoveToTile,
  canPlaceEntity,
  getEntitiesOfType,
  hasEntity,
  addEntityToTile,
  removeEntityFromTile,
  HexMap
} from './hexTiles';
