// MongoDB initialization script
// This script runs when the container is first created

db = db.getSiblingDB('umbral-nexus');

// Create collections with schema validation
db.createCollection('games', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['gameId', 'name', 'host', 'config', 'state', 'createdAt'],
      properties: {
        gameId: {
          bsonType: 'string',
          description: 'Unique game identifier'
        },
        name: {
          bsonType: 'string',
          maxLength: 50,
          description: 'Game name'
        },
        host: {
          bsonType: 'string',
          description: 'Host player ID'
        },
        config: {
          bsonType: 'object',
          required: ['playerCap', 'endConditions', 'difficulty'],
          properties: {
            playerCap: {
              bsonType: 'int',
              minimum: 1,
              maximum: 20
            },
            endConditions: {
              bsonType: 'object',
              required: ['type', 'value']
            },
            difficulty: {
              enum: ['normal', 'hard', 'nightmare']
            }
          }
        },
        state: {
          enum: ['lobby', 'in_progress', 'completed']
        }
      }
    }
  }
});

// Create indexes
db.games.createIndex({ gameId: 1 }, { unique: true });
db.games.createIndex({ state: 1, createdAt: -1 });
db.games.createIndex({ 'players.playerId': 1 });
db.games.createIndex({ endedAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index - delete after 24 hours

// Create players collection
db.createCollection('players', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['playerId', 'lastSeen'],
      properties: {
        playerId: {
          bsonType: 'string',
          description: 'Unique player identifier'
        },
        name: {
          bsonType: 'string',
          maxLength: 30
        },
        stats: {
          bsonType: 'object',
          properties: {
            gamesPlayed: { bsonType: 'int' },
            floorsCleared: { bsonType: 'int' },
            enemiesDefeated: { bsonType: 'int' },
            damageDealt: { bsonType: 'long' },
            healingDone: { bsonType: 'long' }
          }
        }
      }
    }
  }
});

db.players.createIndex({ playerId: 1 }, { unique: true });
db.players.createIndex({ lastSeen: 1 });

print('MongoDB initialization complete');