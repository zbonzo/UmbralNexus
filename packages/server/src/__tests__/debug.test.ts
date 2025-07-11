import request from 'supertest';
import app from '../index';
import { connectDatabase, disconnectDatabase } from '../config/database';

// Set debug log level
process.env.LOG_LEVEL = 'debug';

describe('Debug API', () => {
  beforeAll(async () => {
    // Use test database
    process.env.MONGODB_URI = 'mongodb://localhost:27017/umbral-nexus-test';
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('should test basic API endpoint', async () => {
    console.log('Testing POST /api/games...');
    
    const gameData = {
      name: 'Test Game',
      hostId: 'test-host-123',
      playerCap: 4,
      difficulty: 'normal',
      endConditions: {
        type: 'TIME_LIMIT',
        value: 3600,
      },
    };

    const response = await request(app)
      .post('/api/games')
      .send(gameData);

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));

    // Don't assert anything, just log for debugging
  }, 10000); // Increase timeout
});