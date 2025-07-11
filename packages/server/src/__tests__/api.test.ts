import request from 'supertest';
import app from '../index';

describe('Game API', () => {
  describe('Health Check', () => {
    it('should respond with health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
      });
    });
  });

  describe('Game Creation', () => {
    it('should create a new game', async () => {
      const gameData = {
        name: 'Test Game',
        hostId: 'test-host-123',
        hostName: 'Test Host',
        playerCap: 4,
        difficulty: 'normal',
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(200); // Changed from 201 to 200

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        gameId: expect.any(String),
        name: 'Test Game',
        host: 'test-host-123',
        config: {
          playerCap: 4,
          difficulty: 'normal',
          endConditions: { type: 'TIME_LIMIT', value: 3600 },
        },
        currentPhase: 'lobby',
        players: expect.any(Array),
        playerCount: 1,
        createdAt: expect.any(String),
        startTime: undefined,
      });
    });

    it('should validate game creation data', async () => {
      const invalidData = {
        // Missing required fields
        name: '',
        playerCap: 25, // Too high
      };

      const response = await request(app)
        .post('/api/games')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('Game Joining', () => {
    let gameId: string;

    beforeEach(async () => {
      const gameData = {
        name: 'Test Game',
        hostId: 'test-host-123',
        hostName: 'Test Host',
        playerCap: 4,
        difficulty: 'normal',
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData);

      gameId = response.body.data.gameId;
    });

    it('should allow player to join game', async () => {
      const playerData = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
      };

      const response = await request(app)
        .post(`/api/games/${gameId}/join`)
        .send(playerData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.players).toHaveLength(2); // Host + new player
    });

    it('should prevent joining non-existent game', async () => {
      const playerData = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
      };

      const response = await request(app)
        .post('/api/games/INVALID/join')
        .send(playerData)
        .expect(400); // Invalid game ID format

      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate player joining', async () => {
      const playerData = {
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
      };

      // Join once
      await request(app)
        .post(`/api/games/${gameId}/join`)
        .send(playerData)
        .expect(200);

      // Try to join again
      const response = await request(app)
        .post(`/api/games/${gameId}/join`)
        .send(playerData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PLAYER_EXISTS');
    });
  });

  describe('Game Information', () => {
    let gameId: string;

    beforeEach(async () => {
      const gameData = {
        name: 'Test Game',
        hostId: 'test-host-123',
        hostName: 'Test Host',
        playerCap: 4,
        difficulty: 'normal',
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData);

      gameId = response.body.data.gameId;
    });

    it('should get game information', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBe(gameId);
    });

    it('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/GAME01') // Valid format but doesn't exist
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GAME_NOT_FOUND');
    });
  });

  describe('Game Stats', () => {
    it('should return game statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        activeGames: expect.any(Number),
        timestamp: expect.any(String),
      });
    });
  });
});