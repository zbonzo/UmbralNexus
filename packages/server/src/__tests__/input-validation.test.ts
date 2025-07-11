import request from 'supertest';
import app from '../index';

describe('Input Validation Edge Cases', () => {
  describe('Player Name Validation', () => {
    it('should reject empty player names', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          hostName: '', // Empty name
          playerCap: 4,
          difficulty: 'normal',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error?.message).toContain('name');
    });

    it('should reject names with only whitespace', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          hostName: '   \t\n  ', // Only whitespace
          playerCap: 4,
          difficulty: 'normal',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should sanitize XSS attempts in player names', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          hostName: '<script>alert("xss")</script>Player',
          playerCap: 4,
          difficulty: 'normal',
        });

      if (response.status === 200) {
        // If accepted, must be sanitized
        expect(response.body.data.players[0].name).not.toContain('<script>');
        expect(response.body.data.players[0].name).not.toContain('</script>');
      }
    });

    it('should handle SQL injection attempts in names', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          hostName: "'; DROP TABLE games; --",
          playerCap: 4,
          difficulty: 'normal',
        });

      // Should either reject or safely handle
      expect(response.status).toBeLessThan(500); // No server error
    });

    it('should handle unicode and emoji in names', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          hostName: '🎮Player名前🎯',
          playerCap: 4,
          difficulty: 'normal',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.players[0].name).toBe('🎮Player名前🎯');
    });

    it('should enforce maximum name length', async () => {
      const longName = 'A'.repeat(100); // Way over limit
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          hostName: longName,
          playerCap: 4,
          difficulty: 'normal',
        });

      if (response.status === 200) {
        // Should truncate or limit
        expect(response.body.data.players[0].name.length).toBeLessThanOrEqual(50);
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Game Configuration Boundaries', () => {
    it('should reject player cap of 0', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: 0,
          difficulty: 'normal',
        });

      expect(response.status).toBe(400);
    });

    it('should reject negative player cap', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: -5,
          difficulty: 'normal',
        });

      expect(response.status).toBe(400);
    });

    it('should reject decimal player cap values', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: 4.5,
          difficulty: 'normal',
        });

      expect(response.status).toBe(400);
    });

    it('should reject player cap above maximum (20)', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: 21,
          difficulty: 'normal',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid difficulty values', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: 4,
          difficulty: 'impossible', // Invalid
        });

      expect(response.status).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          // Missing name
          hostId: 'test-host',
          playerCap: 4,
        });

      expect(response.status).toBe(400);
    });

    it('should handle null values in required fields', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: null,
          hostId: null,
          playerCap: null,
          difficulty: null,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Game ID Validation', () => {
    it('should reject invalid game ID format on join', async () => {
      const response = await request(app)
        .post('/api/games/INVALID-FORMAT/join')
        .send({
          playerId: 'player-1',
          name: 'Player One',
          class: 'warrior',
        });

      expect(response.status).toBe(400);
    });

    it('should handle case sensitivity in game IDs', async () => {
      // First create a game
      const createResponse = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: 4,
          difficulty: 'normal',
        });

      const gameId = createResponse.body.data?.gameId;
      if (gameId) {
        // Try joining with lowercase version
        const joinResponse = await request(app)
          .post(`/api/games/${gameId.toLowerCase()}/join`)
          .send({
            playerId: 'player-1',
            name: 'Player One',
            class: 'warrior',
          });

        // Should either work (case insensitive) or fail gracefully
        expect(joinResponse.status).toBeGreaterThanOrEqual(200);
        expect(joinResponse.status).toBeLessThan(500);
      }
    });

    it('should reject special characters in game IDs', async () => {
      const response = await request(app)
        .post('/api/games/<script>/join')
        .send({
          playerId: 'player-1',
          name: 'Player One',
          class: 'warrior',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('JSON Payload Validation', () => {
    it('should reject malformed JSON', async () => {
      const response = await request(app)
        .post('/api/games')
        .set('Content-Type', 'application/json')
        .send('{invalid json');

      expect(response.status).toBe(400);
    });

    it('should reject payloads exceeding size limit', async () => {
      const hugeString = 'A'.repeat(10 * 1024 * 1024); // 10MB
      const response = await request(app)
        .post('/api/games')
        .send({
          name: hugeString,
          hostId: 'test-host',
          playerCap: 4,
          difficulty: 'normal',
        });

      // Should reject with 413 or handle gracefully (500 is acceptable for middleware issues)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle deeply nested objects', async () => {
      let deepObject: any = { value: 'test' };
      for (let i = 0; i < 100; i++) {
        deepObject = { nested: deepObject };
      }

      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          hostId: 'test-host',
          playerCap: 4,
          difficulty: 'normal',
          extra: deepObject,
        });

      // Should handle gracefully
      expect(response.status).toBeLessThan(500);
    });
  });
});
