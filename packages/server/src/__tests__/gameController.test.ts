import request from 'supertest';
import express from 'express';
import { GameController } from '../controllers/gameController';
import { GameManager } from '../game-engine/gameManager';
import { logger } from '../utils/logger';

// Mock the logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock GameManager
jest.mock('../game-engine/gameManager');

describe('GameController', () => {
  let app: express.Application;
  let gameController: GameController;
  let mockGameManager: jest.Mocked<GameManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock GameManager instance
    mockGameManager = {
      createGame: jest.fn(),
      joinGame: jest.fn(),
      getGame: jest.fn(),
      startGame: jest.fn(),
      leaveGame: jest.fn(),
      getActiveGameCount: jest.fn(),
    } as jest.Mocked<GameManager>;

    gameController = new GameController(mockGameManager);
    
    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Setup routes
    app.post('/games', gameController.createGame);
    app.post('/games/join', gameController.joinGame);
    app.get('/games/:gameId', gameController.getGame);
    app.post('/games/:gameId/start', gameController.startGame);
    app.post('/games/:gameId/leave', gameController.leaveGame);
    app.get('/stats', gameController.getGameStats);
  });

  describe('createGame', () => {
    it('should create a game successfully', async () => {
      const mockGame = {
        gameId: 'ABC123',
        name: 'Test Game',
        host: 'host-123',
        config: {
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        },
        currentPhase: 'lobby',
        players: [],
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      };

      mockGameManager.createGame.mockResolvedValue({
        gameId: 'ABC123',
        game: mockGame,
      });

      const response = await request(app)
        .post('/games')
        .send({
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          gameId: 'ABC123',
          name: 'Test Game',
          host: 'host-123',
          config: mockGame.config,
          currentPhase: 'lobby',
          playerCount: 0,
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      });

      expect(mockGameManager.createGame).toHaveBeenCalledWith({
        name: 'Test Game',
        hostId: 'host-123',
        playerCap: 4,
        difficulty: 'normal',
        endConditions: { type: 'TIME_LIMIT', value: 3600 }
      });
      expect(logger.info).toHaveBeenCalledWith('Game created via API: ABC123');
    });

    it('should return 400 for invalid game data', async () => {
      const response = await request(app)
        .post('/games')
        .send({
          name: '',
          hostId: 'host-123',
          playerCap: 25, // Too high
          difficulty: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid game configuration');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/games')
        .send({
          name: 'Test Game',
          // Missing hostId, playerCap, difficulty, endConditions
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 for GameManager errors', async () => {
      mockGameManager.createGame.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/games')
        .send({
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create game',
        },
      });
      expect(logger.error).toHaveBeenCalledWith('Error creating game:', expect.any(Error));
    });

    it('should validate player cap bounds', async () => {
      const responses = await Promise.all([
        request(app).post('/games').send({
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 0, // Too low
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        }),
        request(app).post('/games').send({
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 21, // Too high
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        }),
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    it('should validate end conditions', async () => {
      const response = await request(app)
        .post('/games')
        .send({
          name: 'Test Game',
          hostId: 'host-123',
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'INVALID_TYPE', value: 3600 }
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('joinGame', () => {
    it('should join a game successfully', async () => {
      const mockGame = {
        gameId: 'ABC123',
        name: 'Test Game',
        host: 'host-123',
        config: { playerCap: 4, difficulty: 'normal' },
        currentPhase: 'lobby',
        players: [{
          playerId: 'player-123',
          name: 'Test Player',
          class: 'warrior',
          level: 1,
          health: 100,
          maxHealth: 100,
          joinedAt: new Date('2023-01-01T00:00:00.000Z'),
        }],
      };

      mockGameManager.joinGame.mockResolvedValue(mockGame);

      const response = await request(app)
        .post('/games/join')
        .send({
          gameId: 'ABC123',
          playerId: 'player-123',
          name: 'Test Player',
          class: 'warrior',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBe('ABC123');
      expect(response.body.data.players).toHaveLength(1);
      expect(response.body.data.players[0].playerId).toBe('player-123');
      
      expect(mockGameManager.joinGame).toHaveBeenCalledWith('ABC123', {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
      });
      expect(logger.info).toHaveBeenCalledWith('Player joined game via API: player-123 -> ABC123');
    });

    it('should return 400 for invalid join data', async () => {
      const response = await request(app)
        .post('/games/join')
        .send({
          gameId: 'ABC', // Too short
          playerId: '',
          name: 'Test Player',
          class: 'invalid-class',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid join request');
    });

    it('should return 404 for game not found', async () => {
      mockGameManager.joinGame.mockRejectedValue(new Error('Game not found'));

      const response = await request(app)
        .post('/games/join')
        .send({
          gameId: 'NOTFND',
          playerId: 'player-123',
          name: 'Test Player',
          class: 'warrior',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_ERROR');
      expect(response.body.error.message).toBe('Game not found');
    });

    it('should return 409 for game full', async () => {
      mockGameManager.joinGame.mockRejectedValue(new Error('Game is full'));

      const response = await request(app)
        .post('/games/join')
        .send({
          gameId: 'ABC123',
          playerId: 'player-123',
          name: 'Test Player',
          class: 'warrior',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_ERROR');
      expect(response.body.error.message).toBe('Game is full');
    });

    it('should return 409 for player already in game', async () => {
      mockGameManager.joinGame.mockRejectedValue(new Error('Player already in game'));

      const response = await request(app)
        .post('/games/join')
        .send({
          gameId: 'ABC123',
          playerId: 'player-123',
          name: 'Test Player',
          class: 'warrior',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_ERROR');
      expect(response.body.error.message).toBe('Player already in game');
    });

    it('should validate all character classes', async () => {
      const classes = ['warrior', 'ranger', 'mage', 'cleric'];
      
      for (const characterClass of classes) {
        mockGameManager.joinGame.mockResolvedValue({
          gameId: 'ABC123',
          name: 'Test Game',
          host: 'host-123',
          config: { playerCap: 4, difficulty: 'normal' },
          currentPhase: 'lobby',
          players: [],
        });

        const response = await request(app)
          .post('/games/join')
          .send({
            gameId: 'ABC123',
            playerId: 'player-123',
            name: 'Test Player',
            class: characterClass,
          });

        expect(response.status).toBe(200);
      }
    });
  });

  describe('getGame', () => {
    it('should get a game successfully', async () => {
      const mockGame = {
        gameId: 'ABC123',
        name: 'Test Game',
        host: 'host-123',
        config: { playerCap: 4, difficulty: 'normal' },
        currentPhase: 'lobby',
        players: [],
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        startTime: undefined,
      };

      mockGameManager.getGame.mockReturnValue(mockGame);

      const response = await request(app)
        .get('/games/ABC123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBe('ABC123');
      expect(response.body.data.name).toBe('Test Game');
      expect(mockGameManager.getGame).toHaveBeenCalledWith('ABC123');
    });

    it('should return 400 for invalid game ID', async () => {
      const response = await request(app)
        .get('/games/ABC'); // Too short

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid game ID');
    });

    it('should return 400 for missing game ID', async () => {
      const response = await request(app)
        .get('/games/');

      expect(response.status).toBe(404); // Express returns 404 for missing route params
    });

    it('should return 404 for game not found', async () => {
      mockGameManager.getGame.mockReturnValue(null);

      const response = await request(app)
        .get('/games/NOTFND');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_NOT_FOUND');
      expect(response.body.error.message).toBe('Game not found');
    });

    it('should return 500 for internal errors', async () => {
      mockGameManager.getGame.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/games/ABC123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get game');
    });

    it('should include start time when game is active', async () => {
      const mockGame = {
        gameId: 'ABC123',
        name: 'Test Game',
        host: 'host-123',
        config: { playerCap: 4, difficulty: 'normal' },
        currentPhase: 'active',
        players: [],
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        startTime: 1672531200000,
      };

      mockGameManager.getGame.mockReturnValue(mockGame);

      const response = await request(app)
        .get('/games/ABC123');

      expect(response.status).toBe(200);
      expect(response.body.data.startTime).toBe(1672531200000);
    });
  });

  describe('startGame', () => {
    it('should start a game successfully', async () => {
      mockGameManager.startGame.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/games/ABC123/start')
        .send({ hostId: 'host-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBe('ABC123');
      expect(response.body.data.message).toBe('Game started successfully');
      expect(response.body.data.timestamp).toBeDefined();
      
      expect(mockGameManager.startGame).toHaveBeenCalledWith('ABC123', 'host-123');
      expect(logger.info).toHaveBeenCalledWith('Game started via API: ABC123');
    });

    it('should return 400 for invalid game ID', async () => {
      const response = await request(app)
        .post('/games/ABC/start') // Too short
        .send({ hostId: 'host-123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid game ID');
    });

    it('should return 400 for missing host ID', async () => {
      const response = await request(app)
        .post('/games/ABC123/start')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Host ID is required');
    });

    it('should return 404 for game not found', async () => {
      mockGameManager.startGame.mockRejectedValue(new Error('Game not found'));

      const response = await request(app)
        .post('/games/NOTFND/start')
        .send({ hostId: 'host-123' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_ERROR');
      expect(response.body.error.message).toBe('Game not found');
    });

    it('should return 403 for unauthorized host', async () => {
      mockGameManager.startGame.mockRejectedValue(new Error('Only the host can start the game'));

      const response = await request(app)
        .post('/games/ABC123/start')
        .send({ hostId: 'wrong-host' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_ERROR');
      expect(response.body.error.message).toBe('Only the host can start the game');
    });

    it('should return 403 for no players', async () => {
      mockGameManager.startGame.mockRejectedValue(new Error('Cannot start game with no players'));

      const response = await request(app)
        .post('/games/ABC123/start')
        .send({ hostId: 'host-123' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_ERROR');
      expect(response.body.error.message).toBe('Cannot start game with no players');
    });
  });

  describe('leaveGame', () => {
    it('should leave a game successfully', async () => {
      mockGameManager.leaveGame.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/games/ABC123/leave')
        .send({ playerId: 'player-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBe('ABC123');
      expect(response.body.data.playerId).toBe('player-123');
      expect(response.body.data.message).toBe('Left game successfully');
      expect(response.body.data.timestamp).toBeDefined();
      
      expect(mockGameManager.leaveGame).toHaveBeenCalledWith('ABC123', 'player-123');
      expect(logger.info).toHaveBeenCalledWith('Player left game via API: player-123 -> ABC123');
    });

    it('should return 400 for invalid game ID', async () => {
      const response = await request(app)
        .post('/games/ABC/leave') // Too short
        .send({ playerId: 'player-123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid game ID');
    });

    it('should return 400 for missing player ID', async () => {
      const response = await request(app)
        .post('/games/ABC123/leave')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Player ID is required');
    });

    it('should return 500 for GameManager errors', async () => {
      mockGameManager.leaveGame.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/games/ABC123/leave')
        .send({ playerId: 'player-123' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to leave game');
      expect(logger.error).toHaveBeenCalledWith('Error leaving game:', expect.any(Error));
    });
  });

  describe('getGameStats', () => {
    it('should get game stats successfully', async () => {
      mockGameManager.getActiveGameCount.mockReturnValue(42);

      const response = await request(app)
        .get('/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activeGames).toBe(42);
      expect(response.body.data.timestamp).toBeDefined();
      expect(mockGameManager.getActiveGameCount).toHaveBeenCalled();
    });

    it('should return 500 for GameManager errors', async () => {
      mockGameManager.getActiveGameCount.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/stats');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get game stats');
      expect(logger.error).toHaveBeenCalledWith('Error getting game stats:', expect.any(Error));
    });

    it('should handle zero active games', async () => {
      mockGameManager.getActiveGameCount.mockReturnValue(0);

      const response = await request(app)
        .get('/stats');

      expect(response.status).toBe(200);
      expect(response.body.data.activeGames).toBe(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/games')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    it('should validate gameId length exactly', async () => {
      const testCases = ['ABC12', 'ABC1234']; // 5 and 7 chars
      
      for (const gameId of testCases) {
        const response = await request(app)
          .get(`/games/${gameId}`);
        
        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle very long names', async () => {
      const longName = 'A'.repeat(51);
      
      const response = await request(app)
        .post('/games')
        .send({
          name: longName,
          hostId: 'host-123',
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle special characters in input', async () => {
      mockGameManager.createGame.mockResolvedValue({
        gameId: 'ABC123',
        game: {
          gameId: 'ABC123',
          name: 'Test <script>',
          host: 'host-123',
          config: { playerCap: 4, difficulty: 'normal', endConditions: { type: 'TIME_LIMIT', value: 3600 } },
          currentPhase: 'lobby',
          players: [],
          createdAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/games')
        .send({
          name: 'Test <script>alert("xss")</script>',
          hostId: 'host-123',
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 }
        });

      expect(response.status).toBe(201);
      // Input validation passes through at controller level
    });
  });
});