import mongoose from 'mongoose';
import { Game, IGame } from '../models/Game';
import type { Player, GameConfig } from '@umbral-nexus/shared';

// Mock mongoose connection but preserve schema functionality
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  
  // Create a mock model that preserves the schema
  const mockModel = jest.fn().mockImplementation((name, schema) => {
    const MockedModel = function(data: any) {
      Object.assign(this, data);
    };
    MockedModel.schema = schema;
    MockedModel.collection = { name: name.toLowerCase() + 's' };
    return MockedModel;
  });
  
  return {
    ...actualMongoose,
    model: mockModel,
    Schema: actualMongoose.Schema,
    Document: actualMongoose.Document,
  };
});

describe('Game Model', () => {
  let mockGameInstance: any;
  let mockSave: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSave = jest.fn().mockResolvedValue(undefined);
    
    // Create a mock game instance with all required properties
    mockGameInstance = {
      gameId: 'ABC123',
      name: 'Test Game',
      host: 'host-123',
      config: {
        playerCap: 4,
        difficulty: 'normal',
        endConditions: { type: 'TIME_LIMIT', value: 3600 }
      },
      players: [],
      floors: [],
      currentPhase: 'lobby',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      save: mockSave,
      
      // Instance methods that we'll test
      addPlayer: Game.schema.methods.addPlayer,
      removePlayer: Game.schema.methods.removePlayer,
      getPlayer: Game.schema.methods.getPlayer,
    };
  });

  describe('Game Schema Structure', () => {
    it('should have correct schema structure', () => {
      const schema = Game.schema;
      
      expect(schema.paths.gameId).toBeDefined();
      expect(schema.paths.name).toBeDefined();
      expect(schema.paths.host).toBeDefined();
      expect(schema.paths.config).toBeDefined();
      expect(schema.paths.players).toBeDefined();
      expect(schema.paths.floors).toBeDefined();
      expect(schema.paths.currentPhase).toBeDefined();
      expect(schema.paths.startTime).toBeDefined();
      expect(schema.paths.endedAt).toBeDefined();
    });

    it('should have correct field validations', () => {
      const schema = Game.schema;
      
      // Check required fields
      expect(schema.paths.gameId.isRequired).toBe(true);
      expect(schema.paths.name.isRequired).toBe(true);
      expect(schema.paths.host.isRequired).toBe(true);
      expect(schema.paths.config.isRequired).toBe(true);
      expect(schema.paths.currentPhase.isRequired).toBe(true);
      
      // Check optional fields (they may not have isRequired property when optional)
      expect(schema.paths.startTime.isRequired).toBeFalsy();
      expect(schema.paths.endedAt.isRequired).toBeFalsy();
    });

    it('should have correct enum validations', () => {
      const schema = Game.schema;
      
      // Check currentPhase enum
      expect(schema.paths.currentPhase.enumValues).toEqual(['lobby', 'active', 'victory', 'defeat']);
    });

    it('should have indexes defined', () => {
      const schema = Game.schema;
      const indexes = schema.indexes();
      
      // Should have at least the indexes we defined
      expect(indexes.length).toBeGreaterThan(0);
      
      // Check for specific indexes (structure may vary)
      const indexFields = indexes.map(index => Object.keys(index[0])).flat();
      expect(indexFields).toContain('gameId');
    });
  });

  describe('Player Schema Structure', () => {
    it('should validate player schema fields', () => {
      const playerSchema = Game.schema.paths.players.schema;
      
      expect(playerSchema.paths.playerId).toBeDefined();
      expect(playerSchema.paths.name).toBeDefined();
      expect(playerSchema.paths.class).toBeDefined();
      expect(playerSchema.paths.level).toBeDefined();
      expect(playerSchema.paths.health).toBeDefined();
      expect(playerSchema.paths.maxHealth).toBeDefined();
      expect(playerSchema.paths.position).toBeDefined();
      expect(playerSchema.paths.abilities).toBeDefined();
      expect(playerSchema.paths.nexusEchoes).toBeDefined();
      expect(playerSchema.paths.inventory).toBeDefined();
      expect(playerSchema.paths.actionPoints).toBeDefined();
    });

    it('should have correct player class enum', () => {
      const playerSchema = Game.schema.paths.players.schema;
      expect(playerSchema.paths.class.enumValues).toEqual(['warrior', 'ranger', 'mage', 'cleric']);
    });

    it('should have correct default values', () => {
      const playerSchema = Game.schema.paths.players.schema;
      expect(playerSchema.paths.level.defaultValue).toBe(1);
      expect(playerSchema.paths.actionPoints.defaultValue).toBe(3);
    });
  });

  describe('Config Schema Structure', () => {
    it('should validate config schema fields', () => {
      const configSchema = Game.schema.paths.config.schema;
      
      expect(configSchema.paths.playerCap).toBeDefined();
      expect(configSchema.paths['endConditions.type']).toBeDefined();
      expect(configSchema.paths['endConditions.value']).toBeDefined();
      expect(configSchema.paths.difficulty).toBeDefined();
    });

    it('should have correct difficulty enum and default', () => {
      const configSchema = Game.schema.paths.config.schema;
      expect(configSchema.paths.difficulty.enumValues).toEqual(['normal', 'hard', 'nightmare']);
      expect(configSchema.paths.difficulty.defaultValue).toBe('normal');
    });

    it('should have correct playerCap validation', () => {
      const configSchema = Game.schema.paths.config.schema;
      const playerCapPath = configSchema.paths.playerCap;
      
      expect(playerCapPath.options.min).toBe(1);
      expect(playerCapPath.options.max).toBe(20);
    });

    it('should validate end conditions enum', () => {
      const configSchema = Game.schema.paths.config.schema;
      const endConditionsTypeField = configSchema.paths['endConditions.type'];
      
      expect(endConditionsTypeField.enumValues).toEqual(['TIME_LIMIT', 'DEATH_COUNT', 'FLOOR_COUNT']);
    });
  });

  describe('Nested Schema Validations', () => {
    it('should validate Position schema', () => {
      const playerSchema = Game.schema.paths.players.schema;
      const positionSchema = playerSchema.paths.position.schema;
      
      expect(positionSchema.paths.floor).toBeDefined();
      expect(positionSchema.paths.x).toBeDefined();
      expect(positionSchema.paths.y).toBeDefined();
      
      expect(positionSchema.paths.floor.isRequired).toBe(true);
      expect(positionSchema.paths.x.isRequired).toBe(true);
      expect(positionSchema.paths.y.isRequired).toBe(true);
    });

    it('should validate StatusEffect schema', () => {
      const playerSchema = Game.schema.paths.players.schema;
      const abilitySchema = playerSchema.paths.abilities.schema;
      const statusEffectSchema = abilitySchema.paths.effects.schema;
      
      expect(statusEffectSchema.paths.type).toBeDefined();
      expect(statusEffectSchema.paths.duration).toBeDefined();
      expect(statusEffectSchema.paths.value).toBeDefined();
      
      expect(statusEffectSchema.paths.type.enumValues).toEqual([
        'stunned', 'slowed', 'poisoned', 'burning', 'frozen', 'blessed', 'marked'
      ]);
    });

    it('should validate Ability schema', () => {
      const playerSchema = Game.schema.paths.players.schema;
      const abilitySchema = playerSchema.paths.abilities.schema;
      
      expect(abilitySchema.paths.id).toBeDefined();
      expect(abilitySchema.paths.name).toBeDefined();
      expect(abilitySchema.paths.description).toBeDefined();
      expect(abilitySchema.paths.cost).toBeDefined();
      expect(abilitySchema.paths.cooldown).toBeDefined();
      expect(abilitySchema.paths.range).toBeDefined();
      expect(abilitySchema.paths.damage).toBeDefined();
      expect(abilitySchema.paths.healing).toBeDefined();
      expect(abilitySchema.paths.effects).toBeDefined();
    });

    it('should validate NexusEcho schema', () => {
      const playerSchema = Game.schema.paths.players.schema;
      const nexusEchoSchema = playerSchema.paths.nexusEchoes.schema;
      
      expect(nexusEchoSchema.paths.id).toBeDefined();
      expect(nexusEchoSchema.paths.name).toBeDefined();
      expect(nexusEchoSchema.paths.description).toBeDefined();
      expect(nexusEchoSchema.paths.category).toBeDefined();
      expect(nexusEchoSchema.paths.stackCount).toBeDefined();
      expect(nexusEchoSchema.paths.maxStacks).toBeDefined();
      
      expect(nexusEchoSchema.paths.category.enumValues).toEqual([
        'offensive', 'defensive', 'utility', 'legendary'
      ]);
    });

    it('should validate Item schema', () => {
      const playerSchema = Game.schema.paths.players.schema;
      const itemSchema = playerSchema.paths.inventory.schema;
      
      expect(itemSchema.paths.id).toBeDefined();
      expect(itemSchema.paths.name).toBeDefined();
      expect(itemSchema.paths.type).toBeDefined();
      expect(itemSchema.paths.quantity).toBeDefined();
      
      expect(itemSchema.paths.type.enumValues).toEqual(['consumable', 'equipment', 'quest']);
    });
  });

  describe('Instance Methods', () => {
    describe('addPlayer', () => {
      it('should add player successfully', async () => {
        const player: Player = {
          playerId: 'player-123',
          name: 'Test Player',
          class: 'warrior',
          level: 1,
          health: 100,
          maxHealth: 100,
          position: { floor: 1, x: 0, y: 0 },
          joinedAt: new Date(),
          abilities: [],
          nexusEchoes: [],
          inventory: [],
          actionPoints: 3,
        };

        await mockGameInstance.addPlayer(player);

        expect(mockGameInstance.players).toHaveLength(1);
        expect(mockGameInstance.players[0]).toEqual(player);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should reject player when game is full', async () => {
        // Fill the game to capacity
        mockGameInstance.config.playerCap = 2;
        mockGameInstance.players = [
          { playerId: 'player-1', name: 'Player 1' },
          { playerId: 'player-2', name: 'Player 2' }
        ];

        const newPlayer: Player = {
          playerId: 'player-3',
          name: 'Player 3',
          class: 'warrior',
          level: 1,
          health: 100,
          maxHealth: 100,
          position: { floor: 1, x: 0, y: 0 },
          joinedAt: new Date(),
          abilities: [],
          nexusEchoes: [],
          inventory: [],
          actionPoints: 3,
        };

        expect(() => mockGameInstance.addPlayer(newPlayer)).toThrow('Game is full');
        expect(mockSave).not.toHaveBeenCalled();
      });

      it('should reject duplicate player', async () => {
        const existingPlayer: Player = {
          playerId: 'player-123',
          name: 'Existing Player',
          class: 'warrior',
          level: 1,
          health: 100,
          maxHealth: 100,
          position: { floor: 1, x: 0, y: 0 },
          joinedAt: new Date(),
          abilities: [],
          nexusEchoes: [],
          inventory: [],
          actionPoints: 3,
        };

        mockGameInstance.players = [existingPlayer];

        const duplicatePlayer: Player = {
          ...existingPlayer,
          name: 'Duplicate Player'
        };

        expect(() => mockGameInstance.addPlayer(duplicatePlayer)).toThrow('Player already in game');
        expect(mockGameInstance.players).toHaveLength(1);
        expect(mockSave).not.toHaveBeenCalled();
      });

      it('should handle all character classes', async () => {
        const classes = ['warrior', 'ranger', 'mage', 'cleric'] as const;
        
        for (const characterClass of classes) {
          const player: Player = {
            playerId: `player-${characterClass}`,
            name: `Test ${characterClass}`,
            class: characterClass,
            level: 1,
            health: 100,
            maxHealth: 100,
            position: { floor: 1, x: 0, y: 0 },
            joinedAt: new Date(),
            abilities: [],
            nexusEchoes: [],
            inventory: [],
            actionPoints: 3,
          };

          await mockGameInstance.addPlayer(player);
          expect(mockGameInstance.players[mockGameInstance.players.length - 1].class).toBe(characterClass);
        }
      });
    });

    describe('removePlayer', () => {
      beforeEach(() => {
        mockGameInstance.players = [
          { playerId: 'player-1', name: 'Player 1' },
          { playerId: 'player-2', name: 'Player 2' },
          { playerId: 'player-3', name: 'Player 3' }
        ];
      });

      it('should remove player successfully', async () => {
        await mockGameInstance.removePlayer('player-2');

        expect(mockGameInstance.players).toHaveLength(2);
        expect(mockGameInstance.players.find(p => p.playerId === 'player-2')).toBeUndefined();
        expect(mockGameInstance.players.find(p => p.playerId === 'player-1')).toBeDefined();
        expect(mockGameInstance.players.find(p => p.playerId === 'player-3')).toBeDefined();
        expect(mockSave).toHaveBeenCalled();
      });

      it('should handle non-existent player gracefully', async () => {
        const originalLength = mockGameInstance.players.length;
        
        await mockGameInstance.removePlayer('non-existent');

        expect(mockGameInstance.players).toHaveLength(originalLength);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should handle empty player list', async () => {
        mockGameInstance.players = [];
        
        await mockGameInstance.removePlayer('player-1');

        expect(mockGameInstance.players).toHaveLength(0);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('getPlayer', () => {
      beforeEach(() => {
        mockGameInstance.players = [
          { playerId: 'player-1', name: 'Player 1', class: 'warrior' },
          { playerId: 'player-2', name: 'Player 2', class: 'mage' },
          { playerId: 'player-3', name: 'Player 3', class: 'cleric' }
        ];
      });

      it('should return player when found', () => {
        const player = mockGameInstance.getPlayer('player-2');

        expect(player).toBeDefined();
        expect(player.playerId).toBe('player-2');
        expect(player.name).toBe('Player 2');
        expect(player.class).toBe('mage');
      });

      it('should return undefined when player not found', () => {
        const player = mockGameInstance.getPlayer('non-existent');

        expect(player).toBeUndefined();
      });

      it('should return undefined for empty player list', () => {
        mockGameInstance.players = [];
        
        const player = mockGameInstance.getPlayer('player-1');

        expect(player).toBeUndefined();
      });
    });
  });

  describe('Schema Options', () => {
    it('should have timestamps enabled', () => {
      const schema = Game.schema;
      expect(schema.options.timestamps).toBe(true);
    });

    it('should have optimistic concurrency enabled', () => {
      const schema = Game.schema;
      expect(schema.options.optimisticConcurrency).toBe(true);
    });

    it('should have correct collection name', () => {
      expect(Game.collection.name).toBe('games');
    });
  });

  describe('Complex Data Validation', () => {
    it('should handle complex player data structure', () => {
      const complexPlayer: Player = {
        playerId: 'player-complex',
        name: 'Complex Player',
        class: 'mage',
        level: 5,
        health: 75,
        maxHealth: 100,
        position: { floor: 2, x: 10, y: 15 },
        joinedAt: new Date('2023-01-01T12:00:00.000Z'),
        abilities: [
          {
            id: 'fireball',
            name: 'Fireball',
            description: 'Throws a fireball',
            cost: 2,
            cooldown: 3,
            range: 5,
            damage: 30,
            effects: [
              { type: 'burning', duration: 3, value: 5 }
            ]
          }
        ],
        nexusEchoes: [
          {
            id: 'fire-mastery',
            name: 'Fire Mastery',
            description: 'Increases fire damage',
            category: 'offensive',
            stackCount: 2,
            maxStacks: 5
          }
        ],
        inventory: [
          {
            id: 'health-potion',
            name: 'Health Potion',
            type: 'consumable',
            quantity: 3
          },
          {
            id: 'magic-staff',
            name: 'Magic Staff',
            type: 'equipment',
            quantity: 1
          }
        ],
        actionPoints: 3,
      };

      mockGameInstance.players = [complexPlayer];
      const retrievedPlayer = mockGameInstance.getPlayer('player-complex');

      expect(retrievedPlayer).toEqual(complexPlayer);
    });

    it('should handle different end condition types', () => {
      const endConditionTypes = [
        { type: 'TIME_LIMIT', value: 3600 },
        { type: 'DEATH_COUNT', value: 5 },
        { type: 'FLOOR_COUNT', value: 10 }
      ];

      endConditionTypes.forEach(endCondition => {
        mockGameInstance.config.endConditions = endCondition;
        expect(mockGameInstance.config.endConditions).toEqual(endCondition);
      });
    });

    it('should handle all game phases', () => {
      const phases = ['lobby', 'active', 'victory', 'defeat'] as const;

      phases.forEach(phase => {
        mockGameInstance.currentPhase = phase;
        expect(mockGameInstance.currentPhase).toBe(phase);
      });
    });

    it('should handle all difficulty levels', () => {
      const difficulties = ['normal', 'hard', 'nightmare'] as const;

      difficulties.forEach(difficulty => {
        mockGameInstance.config.difficulty = difficulty;
        expect(mockGameInstance.config.difficulty).toBe(difficulty);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum player capacity', () => {
      const players = Array.from({ length: 20 }, (_, i) => ({
        playerId: `player-${i}`,
        name: `Player ${i}`,
        class: 'warrior' as const
      }));

      mockGameInstance.config.playerCap = 20;
      mockGameInstance.players = players;

      expect(mockGameInstance.players).toHaveLength(20);
      
      // Adding one more should fail
      const extraPlayer: Player = {
        playerId: 'player-extra',
        name: 'Extra Player',
        class: 'warrior',
        level: 1,
        health: 100,
        maxHealth: 100,
        position: { floor: 1, x: 0, y: 0 },
        joinedAt: new Date(),
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        actionPoints: 3,
      };

      expect(() => mockGameInstance.addPlayer(extraPlayer)).toThrow('Game is full');
    });

    it('should handle empty game data', () => {
      mockGameInstance.players = [];
      mockGameInstance.floors = [];

      expect(mockGameInstance.players).toHaveLength(0);
      expect(mockGameInstance.floors).toHaveLength(0);
      expect(mockGameInstance.getPlayer('any-id')).toBeUndefined();
    });

    it('should handle special characters in names', () => {
      const specialCharPlayer: Player = {
        playerId: 'player-special',
        name: 'Player with Special Chars: åäö!@#$%^&*()',
        class: 'ranger',
        level: 1,
        health: 80,
        maxHealth: 80,
        position: { floor: 1, x: 0, y: 0 },
        joinedAt: new Date(),
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        actionPoints: 3,
      };

      mockGameInstance.players = [specialCharPlayer];
      const retrieved = mockGameInstance.getPlayer('player-special');
      expect(retrieved.name).toBe('Player with Special Chars: åäö!@#$%^&*()');
    });
  });
});