import {
  getVisibilityRange,
  calculateVisibleTiles,
  hasLineOfSight,
  calculateLineOfSightVisibility,
  updatePlayerVisibility,
  isVisibleToAnyPlayer,
  getSharedVisibility,
} from '../utils/visibilityUtils';
import type { Position, Tile } from '../types/game';

describe('Visibility Utilities', () => {
  // Helper function to create a simple tile
  const createTile = (x: number, y: number, type: 'floor' | 'wall' = 'floor'): Tile => ({
    x,
    y,
    type,
    isWalkable: type !== 'wall',
    isVisible: false,
    isExplored: false,
  });

  // Helper function to create a map
  const createMap = (width: number, height: number, walls: Position[] = []): Tile[][] => {
    const tiles: Tile[][] = [];
    for (let y = 0; y < height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < width; x++) {
        const isWall = walls.some(w => w.x === x && w.y === y);
        row.push(createTile(x, y, isWall ? 'wall' : 'floor'));
      }
      tiles.push(row);
    }
    return tiles;
  };

  describe('getVisibilityRange', () => {
    it('should return correct base range for each class', () => {
      expect(getVisibilityRange('warrior', 1)).toBe(3);
      expect(getVisibilityRange('ranger', 1)).toBe(5);
      expect(getVisibilityRange('mage', 1)).toBe(4);
      expect(getVisibilityRange('cleric', 1)).toBe(4);
    });

    it('should use default range for unknown class', () => {
      expect(getVisibilityRange('unknown', 1)).toBe(3);
    });

    it('should increase range with level', () => {
      expect(getVisibilityRange('warrior', 5)).toBe(4); // 3 + 1
      expect(getVisibilityRange('ranger', 10)).toBe(7); // 5 + 2
      expect(getVisibilityRange('mage', 15)).toBe(7); // 4 + 3
    });

    it('should handle level 0', () => {
      expect(getVisibilityRange('warrior', 0)).toBe(3);
    });
  });

  describe('calculateVisibleTiles', () => {
    it('should return tiles within range', () => {
      const position: Position = { x: 5, y: 5, floor: 1 };
      const visible = calculateVisibleTiles(position, 2, 10, 10);
      
      // Should include center and all tiles within Manhattan distance 2
      expect(visible).toHaveLength(13);
      expect(visible).toContainEqual({ x: 5, y: 5, floor: 1 }); // Center
      expect(visible).toContainEqual({ x: 5, y: 3, floor: 1 }); // 2 up
      expect(visible).toContainEqual({ x: 3, y: 5, floor: 1 }); // 2 left
    });

    it('should respect map boundaries', () => {
      const position: Position = { x: 0, y: 0, floor: 1 };
      const visible = calculateVisibleTiles(position, 3, 5, 5);
      
      // Should not include negative coordinates
      visible.forEach(tile => {
        expect(tile.x).toBeGreaterThanOrEqual(0);
        expect(tile.y).toBeGreaterThanOrEqual(0);
        expect(tile.x).toBeLessThan(5);
        expect(tile.y).toBeLessThan(5);
      });
    });

    it('should handle corner positions', () => {
      const position: Position = { x: 9, y: 9, floor: 1 };
      const visible = calculateVisibleTiles(position, 2, 10, 10);
      
      visible.forEach(tile => {
        expect(tile.x).toBeLessThanOrEqual(9);
        expect(tile.y).toBeLessThanOrEqual(9);
      });
    });

    it('should handle range 0', () => {
      const position: Position = { x: 5, y: 5, floor: 1 };
      const visible = calculateVisibleTiles(position, 0, 10, 10);
      
      expect(visible).toHaveLength(1);
      expect(visible[0]).toEqual(position);
    });
  });

  describe('hasLineOfSight', () => {
    it('should return true for clear line', () => {
      const tiles = createMap(10, 10);
      const from: Position = { x: 0, y: 0, floor: 1 };
      const to: Position = { x: 5, y: 5, floor: 1 };
      
      expect(hasLineOfSight(from, to, tiles)).toBe(true);
    });

    it('should return false when blocked by wall', () => {
      const walls = [{ x: 2, y: 2, floor: 1 }];
      const tiles = createMap(10, 10, walls);
      const from: Position = { x: 0, y: 0, floor: 1 };
      const to: Position = { x: 5, y: 5, floor: 1 };
      
      expect(hasLineOfSight(from, to, tiles)).toBe(false);
    });

    it('should handle horizontal line', () => {
      const tiles = createMap(10, 10);
      const from: Position = { x: 0, y: 5, floor: 1 };
      const to: Position = { x: 9, y: 5, floor: 1 };
      
      expect(hasLineOfSight(from, to, tiles)).toBe(true);
    });

    it('should handle vertical line', () => {
      const tiles = createMap(10, 10);
      const from: Position = { x: 5, y: 0, floor: 1 };
      const to: Position = { x: 5, y: 9, floor: 1 };
      
      expect(hasLineOfSight(from, to, tiles)).toBe(true);
    });

    it('should handle same position', () => {
      const tiles = createMap(10, 10);
      const position: Position = { x: 5, y: 5, floor: 1 };
      
      expect(hasLineOfSight(position, position, tiles)).toBe(true);
    });

    it('should handle empty map', () => {
      const tiles: Tile[][] = [];
      const from: Position = { x: 0, y: 0, floor: 1 };
      const to: Position = { x: 5, y: 5, floor: 1 };
      
      expect(hasLineOfSight(from, to, tiles)).toBe(true);
    });

    it('should handle positions outside map bounds', () => {
      const tiles = createMap(5, 5);
      const from: Position = { x: 0, y: 0, floor: 1 };
      const to: Position = { x: 10, y: 10, floor: 1 };
      
      expect(hasLineOfSight(from, to, tiles)).toBe(true);
    });
  });

  describe('calculateLineOfSightVisibility', () => {
    it('should return only visible tiles', () => {
      const walls = [
        { x: 3, y: 2, floor: 1 },
        { x: 3, y: 3, floor: 1 },
        { x: 3, y: 4, floor: 1 },
      ];
      const tiles = createMap(10, 10, walls);
      const position: Position = { x: 1, y: 3, floor: 1 };
      
      const visible = calculateLineOfSightVisibility(position, 5, tiles);
      
      // Should not see past the wall
      visible.forEach(tile => {
        expect(tile.x).toBeLessThanOrEqual(3);
      });
    });

    it('should include position itself', () => {
      const tiles = createMap(10, 10);
      const position: Position = { x: 5, y: 5, floor: 1 };
      
      const visible = calculateLineOfSightVisibility(position, 3, tiles);
      
      expect(visible).toContainEqual(position);
    });

    it('should handle empty map', () => {
      const tiles: Tile[][] = [];
      const position: Position = { x: 5, y: 5, floor: 1 };
      
      const visible = calculateLineOfSightVisibility(position, 3, tiles);
      
      expect(visible).toHaveLength(0);
    });
  });

  describe('updatePlayerVisibility', () => {
    it('should mark visible tiles', () => {
      const tiles = createMap(10, 10);
      const position: Position = { x: 5, y: 5, floor: 1 };
      
      const updated = updatePlayerVisibility(position, 'warrior', 1, tiles);
      
      // Center should be visible
      expect(updated[5]![5]!.isVisible).toBe(true);
      expect(updated[5]![5]!.isExplored).toBe(true);
      
      // Adjacent tiles should be visible
      expect(updated[4]![5]!.isVisible).toBe(true);
      expect(updated[6]![5]!.isVisible).toBe(true);
    });

    it('should keep explored tiles but hide non-visible', () => {
      let tiles = createMap(10, 10);
      const pos1: Position = { x: 0, y: 0, floor: 1 };
      const pos2: Position = { x: 9, y: 9, floor: 1 };
      
      // First position
      tiles = updatePlayerVisibility(pos1, 'warrior', 1, tiles);
      expect(tiles[0]![0]!.isVisible).toBe(true);
      expect(tiles[0]![0]!.isExplored).toBe(true);
      
      // Move to second position
      tiles = updatePlayerVisibility(pos2, 'warrior', 1, tiles);
      expect(tiles[0]![0]!.isVisible).toBe(false); // No longer visible
      expect(tiles[0]![0]!.isExplored).toBe(true); // Still explored
      expect(tiles[9]![9]!.isVisible).toBe(true); // New position visible
    });

    it('should not mutate original tiles', () => {
      const tiles = createMap(5, 5);
      const original = JSON.parse(JSON.stringify(tiles));
      const position: Position = { x: 2, y: 2, floor: 1 };
      
      updatePlayerVisibility(position, 'warrior', 1, tiles);
      
      expect(tiles).toEqual(original);
    });
  });

  describe('isVisibleToAnyPlayer', () => {
    it('should return true if visible to at least one player', () => {
      const tiles = createMap(10, 10);
      const position: Position = { x: 5, y: 5, floor: 1 };
      const playerPositions = [
        { x: 3, y: 3, floor: 1 },
        { x: 7, y: 7, floor: 1 },
      ];
      const classes = ['warrior', 'ranger'];
      const levels = [1, 1];
      
      expect(isVisibleToAnyPlayer(position, playerPositions, classes, levels, tiles)).toBe(true);
    });

    it('should return false if not visible to any player', () => {
      const walls = [
        { x: 4, y: 0, floor: 1 },
        { x: 4, y: 1, floor: 1 },
        { x: 4, y: 2, floor: 1 },
        { x: 4, y: 3, floor: 1 },
        { x: 4, y: 4, floor: 1 },
        { x: 4, y: 5, floor: 1 },
        { x: 4, y: 6, floor: 1 },
        { x: 4, y: 7, floor: 1 },
        { x: 4, y: 8, floor: 1 },
        { x: 4, y: 9, floor: 1 },
      ];
      const tiles = createMap(10, 10, walls);
      const position: Position = { x: 8, y: 5, floor: 1 };
      const playerPositions = [{ x: 1, y: 5, floor: 1 }];
      const classes = ['warrior'];
      const levels = [1];
      
      expect(isVisibleToAnyPlayer(position, playerPositions, classes, levels, tiles)).toBe(false);
    });

    it('should handle empty player arrays', () => {
      const tiles = createMap(10, 10);
      const position: Position = { x: 5, y: 5, floor: 1 };
      
      expect(isVisibleToAnyPlayer(position, [], [], [], tiles)).toBe(false);
    });

    it('should respect character visibility ranges', () => {
      const tiles = createMap(10, 10);
      const position: Position = { x: 5, y: 0, floor: 1 };
      const playerPositions = [{ x: 5, y: 5, floor: 1 }];
      
      // Warrior with range 3 can't see 5 tiles away
      expect(isVisibleToAnyPlayer(position, playerPositions, ['warrior'], [1], tiles)).toBe(false);
      
      // Ranger with range 5 can see 5 tiles away
      expect(isVisibleToAnyPlayer(position, playerPositions, ['ranger'], [1], tiles)).toBe(true);
    });
  });

  describe('getSharedVisibility', () => {
    it('should combine visibility from multiple players', () => {
      const tiles = createMap(10, 10);
      const playerPositions = [
        { x: 0, y: 0, floor: 1 },
        { x: 9, y: 9, floor: 1 },
      ];
      const classes = ['warrior', 'warrior'];
      const levels = [1, 1];
      
      const shared = getSharedVisibility(playerPositions, classes, levels, tiles);
      
      // Should see both corners
      expect(shared).toContainEqual({ x: 0, y: 0, floor: 1 });
      expect(shared).toContainEqual({ x: 9, y: 9, floor: 1 });
    });

    it('should not duplicate tiles', () => {
      const tiles = createMap(10, 10);
      const playerPositions = [
        { x: 5, y: 5, floor: 1 },
        { x: 5, y: 6, floor: 1 }, // Overlapping visibility
      ];
      const classes = ['warrior', 'warrior'];
      const levels = [1, 1];
      
      const shared = getSharedVisibility(playerPositions, classes, levels, tiles);
      
      // Check for duplicates
      const uniquePositions = new Set(shared.map(p => `${p.x},${p.y},${p.floor}`));
      expect(uniquePositions.size).toBe(shared.length);
    });

    it('should handle empty player arrays', () => {
      const tiles = createMap(10, 10);
      const shared = getSharedVisibility([], [], [], tiles);
      
      expect(shared).toHaveLength(0);
    });

    it('should preserve floor information', () => {
      const tiles = createMap(10, 10);
      const playerPositions = [
        { x: 5, y: 5, floor: 2 },
        { x: 5, y: 5, floor: 3 },
      ];
      const classes = ['warrior', 'warrior'];
      const levels = [1, 1];
      
      const shared = getSharedVisibility(playerPositions, classes, levels, tiles);
      
      const floors = new Set(shared.map(p => p.floor));
      expect(floors.has(2)).toBe(true);
      expect(floors.has(3)).toBe(true);
    });
  });
});