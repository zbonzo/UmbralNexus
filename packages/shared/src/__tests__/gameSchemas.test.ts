import {
  positionSchema,
  abilitySchema,
  nexusEchoSchema,
  itemSchema,
  gameConfigSchema,
  playerSchema,
  gameStateSchema,
  gameErrorSchema,
  validateGameConfig,
  validatePlayer,
  validateGameState,
  validateGameError,
  safeValidateGameConfig,
  safeValidatePlayer,
  safeValidateGameState,
  safeValidateGameError,
} from '../schemas/gameSchemas';

describe('Game Schemas', () => {
  describe('positionSchema', () => {
    it('should validate valid position', () => {
      const valid = { x: 5, y: 10, floor: 2 };
      expect(() => positionSchema.parse(valid)).not.toThrow();
    });

    it('should validate position without floor', () => {
      const valid = { x: 5, y: 10 };
      expect(() => positionSchema.parse(valid)).not.toThrow();
    });

    it('should reject negative coordinates', () => {
      expect(() => positionSchema.parse({ x: -1, y: 5 })).toThrow();
      expect(() => positionSchema.parse({ x: 5, y: -1 })).toThrow();
    });

    it('should reject non-integer coordinates', () => {
      expect(() => positionSchema.parse({ x: 5.5, y: 10 })).toThrow();
    });

    it('should reject floor less than 1', () => {
      expect(() => positionSchema.parse({ x: 5, y: 10, floor: 0 })).toThrow();
    });
  });

  describe('abilitySchema', () => {
    it('should validate valid ability', () => {
      const ability = {
        id: 'ability-1',
        name: 'Fireball',
        cost: 3,
        cooldown: 5,
        description: 'Launches a fireball',
      };
      expect(() => abilitySchema.parse(ability)).not.toThrow();
    });

    it('should validate ability without description', () => {
      const ability = {
        id: 'ability-1',
        name: 'Fireball',
        cost: 3,
        cooldown: 0,
      };
      expect(() => abilitySchema.parse(ability)).not.toThrow();
    });

    it('should reject empty id or name', () => {
      expect(() => abilitySchema.parse({
        id: '',
        name: 'Test',
        cost: 1,
        cooldown: 0,
      })).toThrow();

      expect(() => abilitySchema.parse({
        id: 'test',
        name: '',
        cost: 1,
        cooldown: 0,
      })).toThrow();
    });

    it('should reject invalid cost', () => {
      expect(() => abilitySchema.parse({
        id: 'test',
        name: 'Test',
        cost: 0,
        cooldown: 0,
      })).toThrow();

      expect(() => abilitySchema.parse({
        id: 'test',
        name: 'Test',
        cost: 11,
        cooldown: 0,
      })).toThrow();
    });

    it('should reject name too long', () => {
      expect(() => abilitySchema.parse({
        id: 'test',
        name: 'A'.repeat(51),
        cost: 1,
        cooldown: 0,
      })).toThrow();
    });
  });

  describe('nexusEchoSchema', () => {
    it('should validate valid nexus echo', () => {
      const echo = {
        id: 'echo-1',
        name: 'Bloodthirst',
        description: 'Gain damage per kill',
        type: 'offensive',
      };
      expect(() => nexusEchoSchema.parse(echo)).not.toThrow();
    });

    it('should validate all echo types', () => {
      const types = ['offensive', 'defensive', 'utility', 'legendary'];
      types.forEach(type => {
        const echo = {
          id: 'echo-1',
          name: 'Test Echo',
          description: 'Test description',
          type,
        };
        expect(() => nexusEchoSchema.parse(echo)).not.toThrow();
      });
    });

    it('should reject invalid type', () => {
      expect(() => nexusEchoSchema.parse({
        id: 'echo-1',
        name: 'Test',
        description: 'Test',
        type: 'invalid',
      })).toThrow();
    });

    it('should reject too long description', () => {
      expect(() => nexusEchoSchema.parse({
        id: 'echo-1',
        name: 'Test',
        description: 'A'.repeat(201),
        type: 'offensive',
      })).toThrow();
    });
  });

  describe('itemSchema', () => {
    it('should validate valid item', () => {
      const item = {
        id: 'item-1',
        name: 'Health Potion',
        type: 'consumable',
        effects: [{ type: 'heal', value: 50 }],
      };
      expect(() => itemSchema.parse(item)).not.toThrow();
    });

    it('should accept empty effects array', () => {
      const item = {
        id: 'item-1',
        name: 'Empty Item',
        type: 'misc',
        effects: [],
      };
      expect(() => itemSchema.parse(item)).not.toThrow();
    });
  });

  describe('gameConfigSchema', () => {
    it('should validate valid game config', () => {
      const config = {
        hostName: 'TestHost',
        playerCap: 10,
        difficulty: 'normal',
      };
      expect(() => gameConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate all difficulties', () => {
      ['normal', 'hard', 'nightmare'].forEach(difficulty => {
        const config = {
          hostName: 'TestHost',
          playerCap: 10,
          difficulty,
        };
        expect(() => gameConfigSchema.parse(config)).not.toThrow();
      });
    });

    it('should reject invalid player cap', () => {
      expect(() => gameConfigSchema.parse({
        hostName: 'TestHost',
        playerCap: 0,
        difficulty: 'normal',
      })).toThrow();

      expect(() => gameConfigSchema.parse({
        hostName: 'TestHost',
        playerCap: 21,
        difficulty: 'normal',
      })).toThrow();
    });

    it('should reject empty host name', () => {
      expect(() => gameConfigSchema.parse({
        hostName: '',
        playerCap: 4,
        difficulty: 'normal',
      })).toThrow();
    });
  });

  describe('playerSchema', () => {
    it('should validate valid player', () => {
      const player = {
        playerId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'TestPlayer',
        class: 'warrior',
        level: 1,
        health: 100,
        maxHealth: 120,
        position: { x: 5, y: 5, floor: 1 },
        actionPoints: 3,
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date(),
      };
      expect(() => playerSchema.parse(player)).not.toThrow();
    });

    it('should validate all character classes', () => {
      ['warrior', 'ranger', 'mage', 'cleric'].forEach(cls => {
        const player = {
          playerId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'TestPlayer',
          class: cls,
          level: 1,
          health: 100,
          maxHealth: 120,
          position: { x: 5, y: 5 },
          actionPoints: 3,
          abilities: [],
          nexusEchoes: [],
          inventory: [],
          joinedAt: new Date(),
        };
        expect(() => playerSchema.parse(player)).not.toThrow();
      });
    });

    it('should reject invalid UUID', () => {
      const player = {
        playerId: 'not-a-uuid',
        name: 'TestPlayer',
        class: 'warrior',
        level: 1,
        health: 100,
        maxHealth: 120,
        position: { x: 5, y: 5 },
        actionPoints: 3,
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date(),
      };
      expect(() => playerSchema.parse(player)).toThrow();
    });

    it('should reject invalid level', () => {
      const player = {
        playerId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'TestPlayer',
        class: 'warrior',
        level: 0,
        health: 100,
        maxHealth: 120,
        position: { x: 5, y: 5 },
        actionPoints: 3,
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date(),
      };
      expect(() => playerSchema.parse(player)).toThrow();
    });

    it('should accept health of 0', () => {
      const player = {
        playerId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'TestPlayer',
        class: 'warrior',
        level: 1,
        health: 0,
        maxHealth: 120,
        position: { x: 5, y: 5 },
        actionPoints: 0,
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date(),
      };
      expect(() => playerSchema.parse(player)).not.toThrow();
    });
  });

  describe('gameStateSchema', () => {
    it('should validate valid game state', () => {
      const state = {
        gameId: 'ABC123',
        players: [],
        currentPhase: 'lobby',
        currentFloor: 1,
      };
      expect(() => gameStateSchema.parse(state)).not.toThrow();
    });

    it('should validate with start time', () => {
      const state = {
        gameId: 'ABC123',
        players: [],
        currentPhase: 'active',
        currentFloor: 1,
        startTime: Date.now(),
      };
      expect(() => gameStateSchema.parse(state)).not.toThrow();
    });

    it('should reject invalid game ID length', () => {
      expect(() => gameStateSchema.parse({
        gameId: 'ABC',
        players: [],
        currentPhase: 'lobby',
        currentFloor: 1,
      })).toThrow();

      expect(() => gameStateSchema.parse({
        gameId: 'ABCDEFG',
        players: [],
        currentPhase: 'lobby',
        currentFloor: 1,
      })).toThrow();
    });

    it('should validate all phases', () => {
      ['lobby', 'active', 'victory', 'defeat'].forEach(phase => {
        const state = {
          gameId: 'ABC123',
          players: [],
          currentPhase: phase,
          currentFloor: 1,
        };
        expect(() => gameStateSchema.parse(state)).not.toThrow();
      });
    });
  });

  describe('gameErrorSchema', () => {
    it('should validate valid error', () => {
      const error = {
        code: 'GAME_NOT_FOUND',
        message: 'Game not found',
      };
      expect(() => gameErrorSchema.parse(error)).not.toThrow();
    });

    it('should validate error with details', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'name', reason: 'too long' },
      };
      expect(() => gameErrorSchema.parse(error)).not.toThrow();
    });

    it('should reject empty code or message', () => {
      expect(() => gameErrorSchema.parse({
        code: '',
        message: 'Test',
      })).toThrow();

      expect(() => gameErrorSchema.parse({
        code: 'TEST',
        message: '',
      })).toThrow();
    });
  });

  describe('Validation functions', () => {
    it('should validate valid data with validateGameConfig', () => {
      const config = {
        hostName: 'TestHost',
        playerCap: 4,
        difficulty: 'normal',
      };
      expect(validateGameConfig(config)).toEqual(config);
    });

    it('should throw on invalid data with validateGameConfig', () => {
      expect(() => validateGameConfig({ invalid: 'data' })).toThrow();
    });

    it('should return success result with safeValidateGameConfig', () => {
      const config = {
        hostName: 'TestHost',
        playerCap: 4,
        difficulty: 'normal',
      };
      const result = safeValidateGameConfig(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });

    it('should return error result with safeValidateGameConfig', () => {
      const result = safeValidateGameConfig({ invalid: 'data' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should work with all validation functions', () => {
      // Test that all functions are exported and work
      expect(typeof validatePlayer).toBe('function');
      expect(typeof validateGameState).toBe('function');
      expect(typeof validateGameError).toBe('function');
      expect(typeof safeValidatePlayer).toBe('function');
      expect(typeof safeValidateGameState).toBe('function');
      expect(typeof safeValidateGameError).toBe('function');
    });
  });
});