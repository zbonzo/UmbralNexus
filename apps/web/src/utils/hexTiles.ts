// Hex tile types and data structures
import type { HexCoordinate } from './hexCoordinates';
import { hexToKey } from './hexCoordinates';
import { hexNeighbors } from './hexNeighbors';
import { hexesInRange } from './hexGeneration';

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
