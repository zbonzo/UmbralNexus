import { GameManager } from '../game-engine/gameManager';
import { ConnectionManager } from '../websocket/connectionManager';
import { Game } from '../models/Game';
import { logger } from '../utils/logger';
import type { CharacterClass, PlayerAction } from '@umbral-nexus/shared';

// Mock dependencies
jest.mock('../models/Game');
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('GameManager', () => {
  let gameManager: GameManager;
  let mockConnectionManager: jest.Mocked<ConnectionManager>;
  let mockGame: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock ConnectionManager
    mockConnectionManager = {
      broadcastToGame: jest.fn(),
      addPlayerToGame: jest.fn(),
      removePlayerFromGame: jest.fn(),
      getPlayersInGame: jest.fn(),
    } as any;

    // Create mock Game instance
    mockGame = {
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
      startTime: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };

    // Mock Game constructor and static methods
    (Game as jest.MockedClass<typeof Game>).mockImplementation(() => mockGame);
    (Game.findOne as jest.Mock) = jest.fn();
    (Game.deleteOne as jest.Mock) = jest.fn();

    gameManager = new GameManager(mockConnectionManager);
  });

  describe('createGame', () => {
    it('should create a game successfully', async () => {
      const config = {
        name: 'Test Game',
        hostId: 'host-123',
        playerCap: 4,
        difficulty: 'normal' as const,
        endConditions: { type: 'TIME_LIMIT' as const, value: 3600 }
      };

      const result = await gameManager.createGame(config);

      expect(result.gameId).toMatch(/^[A-Z0-9]{6}$/);
      expect(result.game).toBe(mockGame);
      expect(mockGame.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Game created: ${result.gameId} by host host-123`)
      );
    });

    it('should handle game creation errors', async () => {
      mockGame.save.mockRejectedValue(new Error('Database error'));

      const config = {
        name: 'Test Game',
        hostId: 'host-123',
        playerCap: 4,
        difficulty: 'normal' as const,
        endConditions: { type: 'TIME_LIMIT' as const, value: 3600 }
      };

      await expect(gameManager.createGame(config)).rejects.toThrow('Failed to create game: Database error');
      expect(logger.error).toHaveBeenCalledWith(
        'Error creating game:',
        expect.objectContaining({
          error: 'Database error',
          config
        })
      );
    });

    it('should generate unique game IDs', async () => {
      const config = {
        name: 'Test Game',
        hostId: 'host-123',
        playerCap: 4,
        difficulty: 'normal' as const,
        endConditions: { type: 'TIME_LIMIT' as const, value: 3600 }
      };

      const results = await Promise.all([
        gameManager.createGame(config),
        gameManager.createGame(config),
        gameManager.createGame(config)
      ]);

      const gameIds = results.map(r => r.gameId);
      const uniqueIds = new Set(gameIds);
      expect(uniqueIds.size).toBe(3);
    });

    it('should validate all difficulty levels', async () => {
      const difficulties: Array<'normal' | 'hard' | 'nightmare'> = ['normal', 'hard', 'nightmare'];
      
      for (const difficulty of difficulties) {
        // Create a fresh mock for each test
        const freshMockGame = {
          gameId: 'ABC123',
          name: 'Test Game',
          host: 'host-123',
          config: {
            playerCap: 4,
            difficulty,
            endConditions: { type: 'TIME_LIMIT' as const, value: 3600 }
          },
          players: [],
          floors: [],
          currentPhase: 'lobby',
          startTime: undefined,
          save: jest.fn().mockResolvedValue(undefined),
        };
        
        (Game as jest.MockedClass<typeof Game>).mockImplementationOnce(() => freshMockGame);

        const config = {
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 4,
          difficulty,
          endConditions: { type: 'TIME_LIMIT' as const, value: 3600 }
        };

        const result = await gameManager.createGame(config);
        expect(result.game.config.difficulty).toBe(difficulty);
      }
    });

    it('should handle different end condition types', async () => {
      const endConditions = [
        { type: 'TIME_LIMIT' as const, value: 3600 },
        { type: 'DEATH_COUNT' as const, value: 5 },
        { type: 'FLOOR_COUNT' as const, value: 10 }
      ];

      for (const endCondition of endConditions) {
        // Create a fresh mock for each test
        const freshMockGame = {
          gameId: 'ABC123',
          name: 'Test Game',
          host: 'host-123',
          config: {
            playerCap: 4,
            difficulty: 'normal' as const,
            endConditions: endCondition
          },
          players: [],
          floors: [],
          currentPhase: 'lobby',
          startTime: undefined,
          save: jest.fn().mockResolvedValue(undefined),
        };
        
        (Game as jest.MockedClass<typeof Game>).mockImplementationOnce(() => freshMockGame);

        const config = {
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 4,
          difficulty: 'normal' as const,
          endConditions: endCondition
        };

        const result = await gameManager.createGame(config);
        expect(result.game.config.endConditions).toEqual(endCondition);
      }
    });
  });

  describe('joinGame', () => {
    beforeEach(() => {
      // Setup game in active games
      gameManager['activeGames'].set('ABC123', mockGame);
    });

    it('should join a game successfully', async () => {
      const player = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior' as CharacterClass
      };

      const result = await gameManager.joinGame('ABC123', player);

      expect(result).toBe(mockGame);
      expect(mockGame.players).toHaveLength(1);
      expect(mockGame.players[0]).toMatchObject({
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
        level: 1,
        health: 120,
        maxHealth: 120,
        actionPoints: 3,
      });
      expect(mockGame.save).toHaveBeenCalled();
      expect(mockConnectionManager.broadcastToGame).toHaveBeenCalledWith(
        'ABC123', 'game-state', expect.any(Object)
      );
    });

    it('should handle different character classes with correct starting stats', async () => {
      const classes: Array<{ class: CharacterClass; health: number }> = [
        { class: 'warrior', health: 120 },
        { class: 'ranger', health: 80 },
        { class: 'mage', health: 60 },
        { class: 'cleric', health: 100 }
      ];

      for (const { class: characterClass, health } of classes) {
        // Reset players array
        mockGame.players = [];
        
        const player = {
          playerId: `player-${characterClass}`,
          name: `Test ${characterClass}`,
          class: characterClass
        };

        await gameManager.joinGame('ABC123', player);

        expect(mockGame.players[0].health).toBe(health);
        expect(mockGame.players[0].maxHealth).toBe(health);
        expect(mockGame.players[0].abilities).toHaveLength(2);
      }
    });

    it('should reject joining when game is full', async () => {
      mockGame.config.playerCap = 2;
      mockGame.players = [
        { playerId: 'player-1', name: 'Player 1' },
        { playerId: 'player-2', name: 'Player 2' }
      ];

      const player = {
        playerId: 'player-3',
        name: 'Player 3',
        class: 'warrior' as CharacterClass
      };

      await expect(gameManager.joinGame('ABC123', player)).rejects.toThrow('Game is full');
    });

    it('should reject joining when game is not in lobby', async () => {
      mockGame.currentPhase = 'active';

      const player = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior' as CharacterClass
      };

      await expect(gameManager.joinGame('ABC123', player)).rejects.toThrow('Game is not in lobby phase');
    });

    it('should reject duplicate player', async () => {
      mockGame.players = [{ playerId: 'player-123', name: 'Existing Player' }];

      const player = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior' as CharacterClass
      };

      await expect(gameManager.joinGame('ABC123', player)).rejects.toThrow('Player already in game');
    });

    it('should load game from database if not in memory', async () => {
      gameManager['activeGames'].clear();
      (Game.findOne as jest.Mock).mockResolvedValue(mockGame);

      const player = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior' as CharacterClass
      };

      const result = await gameManager.joinGame('ABC123', player);

      expect(Game.findOne).toHaveBeenCalledWith({ gameId: 'ABC123' });
      expect(result).toBe(mockGame);
      expect(gameManager['activeGames'].get('ABC123')).toBe(mockGame);
    });

    it('should throw error if game not found in database', async () => {
      gameManager['activeGames'].clear();
      (Game.findOne as jest.Mock).mockResolvedValue(null);

      const player = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior' as CharacterClass
      };

      await expect(gameManager.joinGame('ABC123', player)).rejects.toThrow('Game not found');
    });
  });

  describe('leaveGame', () => {
    beforeEach(() => {
      mockGame.players = [
        { playerId: 'host-123', name: 'Host Player' },
        { playerId: 'player-456', name: 'Other Player' }
      ];
      mockGame.host = 'host-123';
      gameManager['activeGames'].set('ABC123', mockGame);
    });

    it('should remove player from game', async () => {
      await gameManager.leaveGame('ABC123', 'player-456');

      expect(mockGame.players).toHaveLength(1);
      expect(mockGame.players[0].playerId).toBe('host-123');
      expect(mockGame.save).toHaveBeenCalled();
      expect(mockConnectionManager.broadcastToGame).toHaveBeenCalledWith(
        'ABC123', 'game-state', expect.any(Object)
      );
    });

    it('should reassign host when host leaves', async () => {
      await gameManager.leaveGame('ABC123', 'host-123');

      expect(mockGame.host).toBe('player-456');
      expect(mockGame.players).toHaveLength(1);
      expect(mockGame.players[0].playerId).toBe('player-456');
      expect(logger.info).toHaveBeenCalledWith('New host assigned for game ABC123: player-456');
    });

    it('should delete empty game', async () => {
      mockGame.players = [{ playerId: 'last-player', name: 'Last Player' }];
      
      await gameManager.leaveGame('ABC123', 'last-player');

      expect(gameManager['activeGames'].has('ABC123')).toBe(false);
      expect(Game.deleteOne).toHaveBeenCalledWith({ gameId: 'ABC123' });
      expect(logger.info).toHaveBeenCalledWith('Empty game ABC123 deleted');
    });

    it('should handle non-existent player gracefully', async () => {
      await gameManager.leaveGame('ABC123', 'non-existent');

      expect(mockGame.players).toHaveLength(2);
      expect(mockGame.save).not.toHaveBeenCalled();
    });

    it('should handle non-existent game gracefully', async () => {
      await gameManager.leaveGame('NOTFND', 'player-123');

      // Should not throw error
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockGame.save.mockRejectedValue(new Error('Database error'));

      await gameManager.leaveGame('ABC123', 'player-456');

      expect(logger.error).toHaveBeenCalledWith(
        'Error leaving game ABC123:',
        expect.any(Error)
      );
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      mockGame.players = [{ playerId: 'host-123', name: 'Host Player' }];
      mockGame.host = 'host-123';
      mockGame.currentPhase = 'lobby';
      gameManager['activeGames'].set('ABC123', mockGame);
    });

    it('should start game successfully', async () => {
      await gameManager.startGame('ABC123', 'host-123');

      expect(mockGame.currentPhase).toBe('active');
      expect(mockGame.startTime).toBeDefined();
      expect(mockGame.floors).toHaveLength(1);
      expect(mockGame.save).toHaveBeenCalled();
      expect(mockConnectionManager.broadcastToGame).toHaveBeenCalledWith(
        'ABC123', 'game-started', expect.objectContaining({
          gameId: 'ABC123',
          startTime: expect.any(Number)
        })
      );
    });

    it('should reject non-host trying to start', async () => {
      await expect(gameManager.startGame('ABC123', 'player-456')).rejects.toThrow(
        'Only the host can start the game'
      );
    });

    it('should reject starting game with no players', async () => {
      mockGame.players = [];

      await expect(gameManager.startGame('ABC123', 'host-123')).rejects.toThrow(
        'Cannot start game with no players'
      );
    });

    it('should reject starting non-existent game', async () => {
      await expect(gameManager.startGame('NOTFND', 'host-123')).rejects.toThrow(
        'Game not found'
      );
    });

    it('should initialize first floor correctly', async () => {
      await gameManager.startGame('ABC123', 'host-123');

      expect(mockGame.floors[0]).toMatchObject({
        id: 1,
        name: 'Starting Floor',
        theme: 'dungeon',
        tiles: [],
        enemies: [],
        items: [],
        stairs: { up: null, down: { floor: 2, x: 10, y: 10 } }
      });
    });
  });

  describe('processPlayerAction', () => {
    beforeEach(() => {
      const mockPlayer = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
        position: { floor: 1, x: 5, y: 5 },
        actionPoints: 3,
        health: 100,
        abilities: [
          { id: 'shield-bash', cost: 1 },
          { id: 'rallying-cry', cost: 2 }
        ],
        inventory: [
          { id: 'health-potion', quantity: 2 }
        ]
      };
      
      mockGame.players = [mockPlayer];
      mockGame.currentPhase = 'active';
      gameManager['activeGames'].set('ABC123', mockGame);
    });

    it('should process MOVE action successfully', async () => {
      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'up'
      };

      await gameManager.processPlayerAction('ABC123', 'player-123', action);

      const player = mockGame.players[0];
      expect(player.position.y).toBe(4);
      expect(player.actionPoints).toBe(2);
      expect(mockConnectionManager.broadcastToGame).toHaveBeenCalledWith(
        'ABC123', 'player-position', expect.objectContaining({
          playerId: 'player-123',
          position: { floor: 1, x: 5, y: 4 }
        })
      );
    });

    it('should process all movement directions', async () => {
      const directions = ['up', 'down', 'left', 'right'] as const;
      const expectedPositions = [
        { x: 5, y: 4 }, // up
        { x: 5, y: 6 }, // down  
        { x: 4, y: 5 }, // left
        { x: 6, y: 5 }  // right
      ];

      for (let i = 0; i < directions.length; i++) {
        const player = mockGame.players[0];
        player.position = { floor: 1, x: 5, y: 5 };
        player.actionPoints = 3;

        const action: PlayerAction = {
          type: 'MOVE',
          direction: directions[i]
        };

        await gameManager.processPlayerAction('ABC123', 'player-123', action);

        expect(player.position.x).toBe(expectedPositions[i].x);
        expect(player.position.y).toBe(expectedPositions[i].y);
      }
    });

    it('should reject movement out of bounds', async () => {
      const player = mockGame.players[0];
      player.position = { floor: 1, x: 0, y: 0 };

      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'left'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Invalid movement: out of bounds');
    });

    it('should reject movement without enough AP', async () => {
      const player = mockGame.players[0];
      player.actionPoints = 0;

      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'up'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Not enough action points');
    });

    it('should process ATTACK action', async () => {
      const action: PlayerAction = {
        type: 'ATTACK',
        targetId: 'enemy-123'
      };

      await gameManager.processPlayerAction('ABC123', 'player-123', action);

      const player = mockGame.players[0];
      expect(player.actionPoints).toBe(2);
    });

    it('should process USE_ABILITY action', async () => {
      const action: PlayerAction = {
        type: 'USE_ABILITY',
        abilityId: 'shield-bash'
      };

      await gameManager.processPlayerAction('ABC123', 'player-123', action);

      const player = mockGame.players[0];
      expect(player.actionPoints).toBe(2);
    });

    it('should reject using non-existent ability', async () => {
      const action: PlayerAction = {
        type: 'USE_ABILITY',
        abilityId: 'non-existent'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Ability not found');
    });

    it('should reject using ability without enough AP', async () => {
      const player = mockGame.players[0];
      player.actionPoints = 1;

      const action: PlayerAction = {
        type: 'USE_ABILITY',
        abilityId: 'rallying-cry' // costs 2 AP
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Not enough action points');
    });

    it('should process USE_ITEM action', async () => {
      const action: PlayerAction = {
        type: 'USE_ITEM',
        itemId: 'health-potion'
      };

      await gameManager.processPlayerAction('ABC123', 'player-123', action);

      const player = mockGame.players[0];
      const item = player.inventory.find(i => i.id === 'health-potion');
      expect(item!.quantity).toBe(1);
    });

    it('should remove item when quantity reaches zero', async () => {
      const player = mockGame.players[0];
      const item = player.inventory.find(i => i.id === 'health-potion')!;
      item.quantity = 1;

      const action: PlayerAction = {
        type: 'USE_ITEM',
        itemId: 'health-potion'
      };

      await gameManager.processPlayerAction('ABC123', 'player-123', action);

      expect(player.inventory.find(i => i.id === 'health-potion')).toBeUndefined();
    });

    it('should reject using non-existent item', async () => {
      const action: PlayerAction = {
        type: 'USE_ITEM',
        itemId: 'non-existent'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Item not found');
    });

    it('should reject using item with zero quantity', async () => {
      const player = mockGame.players[0];
      const item = player.inventory.find(i => i.id === 'health-potion')!;
      item.quantity = 0;

      const action: PlayerAction = {
        type: 'USE_ITEM',
        itemId: 'health-potion'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Item quantity is zero');
    });

    it('should reject unknown action type', async () => {
      const action = {
        type: 'UNKNOWN_ACTION'
      } as any;

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Unknown action type: UNKNOWN_ACTION');
    });

    it('should reject action from non-existent player', async () => {
      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'up'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'non-existent', action))
        .rejects.toThrow('Player not found in game');
    });

    it('should reject action when game is not active', async () => {
      mockGame.currentPhase = 'lobby';

      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'up'
      };

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow('Game is not active');
    });

    it('should reject action for non-existent game', async () => {
      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'up'
      };

      await expect(gameManager.processPlayerAction('NOTFND', 'player-123', action))
        .rejects.toThrow('Game not found');
    });
  });

  describe('getGame', () => {
    it('should return game from active games', () => {
      gameManager['activeGames'].set('ABC123', mockGame);

      const result = gameManager.getGame('ABC123');

      expect(result).toBe(mockGame);
    });

    it('should return undefined for non-existent game', () => {
      const result = gameManager.getGame('NOTFND');

      expect(result).toBeUndefined();
    });
  });

  describe('getActiveGameCount', () => {
    it('should return correct count of active games', () => {
      gameManager['activeGames'].set('ABC123', mockGame);
      gameManager['activeGames'].set('DEF456', mockGame);

      const count = gameManager.getActiveGameCount();

      expect(count).toBe(2);
    });

    it('should return zero when no active games', () => {
      const count = gameManager.getActiveGameCount();

      expect(count).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clear all active games', async () => {
      gameManager['activeGames'].set('ABC123', mockGame);
      gameManager['activeGames'].set('DEF456', mockGame);

      await gameManager.cleanup();

      expect(gameManager['activeGames'].size).toBe(0);
      expect(logger.info).toHaveBeenCalledWith('GameManager cleanup completed');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle boundary movement conditions', async () => {
      const player = mockGame.players[0] = {
        playerId: 'player-123',
        position: { floor: 1, x: 19, y: 19 },
        actionPoints: 3
      };
      
      mockGame.currentPhase = 'active';
      gameManager['activeGames'].set('ABC123', mockGame);

      // Test boundaries
      const boundaryTests = [
        { direction: 'right' as const, shouldFail: true },
        { direction: 'down' as const, shouldFail: true },
        { direction: 'left' as const, shouldFail: false },
        { direction: 'up' as const, shouldFail: false }
      ];

      for (const { direction, shouldFail } of boundaryTests) {
        player.position = { floor: 1, x: 19, y: 19 };
        player.actionPoints = 3;

        const action: PlayerAction = { type: 'MOVE', direction };

        if (shouldFail) {
          await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
            .rejects.toThrow('Invalid movement: out of bounds');
        } else {
          await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
            .resolves.not.toThrow();
        }
      }
    });

    it('should handle concurrent player joins', async () => {
      mockGame.config.playerCap = 2;
      mockGame.players = [{ playerId: 'existing-player' }];
      gameManager['activeGames'].set('ABC123', mockGame);

      const player1 = { playerId: 'player-1', name: 'Player 1', class: 'warrior' as CharacterClass };
      const player2 = { playerId: 'player-2', name: 'Player 2', class: 'mage' as CharacterClass };

      // First should succeed
      await gameManager.joinGame('ABC123', player1);
      
      // Second should fail (game is now full)
      await expect(gameManager.joinGame('ABC123', player2))
        .rejects.toThrow('Game is full');
    });

    it('should validate character classes correctly', async () => {
      const validClasses: CharacterClass[] = ['warrior', 'ranger', 'mage', 'cleric'];
      
      for (const characterClass of validClasses) {
        mockGame.players = [];
        gameManager['activeGames'].set('ABC123', mockGame);
        
        const player = {
          playerId: `player-${characterClass}`,
          name: `Test ${characterClass}`,
          class: characterClass
        };

        await expect(gameManager.joinGame('ABC123', player)).resolves.not.toThrow();
        expect(mockGame.players[0].class).toBe(characterClass);
      }
    });

    it('should handle database save failures gracefully', async () => {
      mockGame.save.mockRejectedValueOnce(new Error('Database connection lost'));
      
      const action: PlayerAction = {
        type: 'MOVE',
        direction: 'up'
      };

      mockGame.players = [{
        playerId: 'player-123',
        position: { floor: 1, x: 5, y: 5 },
        actionPoints: 3
      }];
      mockGame.currentPhase = 'active';
      gameManager['activeGames'].set('ABC123', mockGame);

      await expect(gameManager.processPlayerAction('ABC123', 'player-123', action))
        .rejects.toThrow();
      
      expect(logger.error).toHaveBeenCalledWith(
        'Error processing action in game ABC123:',
        expect.any(Error)
      );
    });
  });
});