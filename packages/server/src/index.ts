import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GAME_CONFIG_CONSTANTS, WEBSOCKET_CONSTANTS, API_CONSTANTS } from '@umbral-nexus/shared';
import { 
  checkRateLimit,
  validateGameId,
  validatePlayerName,
  validateGameName,
  validatePlayerCap,
  validateCharacterClass,
  validateDifficulty,
  validateRequiredFields,
  createValidationChain,
  checkWebSocketRateLimit
} from './middleware/validationMiddleware';
import { 
  sendGameSuccess,
  sendGameNotFound,
  handleGameError,
  createSuccessResponse
} from './utils/responseUtils';

const app = express();
const PORT = 8888;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Validation chains for different endpoints
const validateGameCreation = createValidationChain(
  validateRequiredFields(['name', 'hostId', 'hostName']),
  validateGameName,
  validatePlayerName('hostName'),
  validatePlayerCap,
  validateDifficulty
);

const validateJoinGame = createValidationChain(
  validateRequiredFields(['playerId', 'name']),
  validatePlayerName('name'),
  validateCharacterClass
);

// In-memory game storage
const gameStates = new Map<string, any>();

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Game creation endpoint
app.post('/api/games', checkRateLimit, ...validateGameCreation, (req, res) => {
  const gameId = Math.random().toString(36).substr(2, GAME_CONFIG_CONSTANTS.GAME_ID_LENGTH).toUpperCase();
  
  const gameData = {
    gameId,
    name: req.body.name,
    host: req.body.hostId,
    config: {
      playerCap: req.body.playerCap || GAME_CONFIG_CONSTANTS.MAX_PLAYERS,
      difficulty: req.body.difficulty || 'normal',
      endConditions: req.body.endConditions || { type: 'TIME_LIMIT', value: 3600 },
    },
    currentPhase: 'lobby',
    players: [{
      playerId: req.body.hostId,
      name: req.body.hostName,
      class: 'warrior',
      position: { 
        floor: GAME_CONFIG_CONSTANTS.DEFAULT_STARTING_FLOOR, 
        x: GAME_CONFIG_CONSTANTS.DEFAULT_SPAWN_X, 
        y: GAME_CONFIG_CONSTANTS.DEFAULT_SPAWN_Y 
      },
      moveSpeed: 5,
      health: 120,
      maxHealth: 120,
      level: 1,
      abilities: [],
      abilityCooldowns: {},
      nexusEchoes: [],
      inventory: [],
      joinedAt: new Date(),
    }],
    playerCount: 1,
    createdAt: new Date().toISOString(),
    startTime: undefined,
  };
  
  gameStates.set(gameId, gameData);
  sendGameSuccess(res, gameData);
});

// Get game endpoint
app.get('/api/games/:gameId', validateGameId, (req, res) => {
  const { gameId } = req.params;
  const game = gameStates.get(gameId);
  
  if (!game) {
    sendGameNotFound(res, gameId);
    return;
  }
  
  sendGameSuccess(res, game);
});

// Stats endpoint
app.get('/api/stats', (_req, res) => {
  const statsData = {
    activeGames: gameStates.size,
    timestamp: new Date().toISOString()
  };
  
  res.json(createSuccessResponse(statsData));
});

// Start game endpoint
app.post('/api/games/:gameId/start', validateGameId, (req, res) => {
  const { gameId } = req.params;
  const { hostId } = req.body;
  
  const game = gameStates.get(gameId);
  if (!game) {
    return res.status(404).json({
      success: false,
      error: { code: 'GAME_NOT_FOUND', message: 'Game not found' }
    });
  }
  
  if (game.host !== hostId) {
    return res.status(403).json({
      success: false,
      error: { code: 'NOT_HOST', message: 'Only the host can start the game' }
    });
  }
  
  game.currentPhase = 'active';
  game.startTime = Date.now();
  
  res.json({ success: true });
});

// Leave game endpoint
app.post('/api/games/:gameId/leave', validateGameId, (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;
  
  const game = gameStates.get(gameId);
  if (!game) {
    return res.status(404).json({
      success: false,
      error: { code: 'GAME_NOT_FOUND', message: 'Game not found' }
    });
  }
  
  game.players = game.players.filter((p: any) => p.playerId !== playerId);
  game.playerCount = game.players.length;
  
  res.json({ success: true });
});

// Join game endpoint
app.post('/api/games/:gameId/join', validateGameId, ...validateJoinGame, (req, res) => {
  const { gameId } = req.params;
  const { playerId, name, class: playerClass } = req.body;
  
  try {
    const game = gameStates.get(gameId);
    if (!game) {
      sendGameNotFound(res, gameId);
      return;
    }
    
    // Check if player already exists
    if (game.players.some((p: any) => p.playerId === playerId)) {
      const error = new Error('Player already in game');
      handleGameError(error, res);
      return;
    }
    
    // Check player cap
    if (game.players.length >= game.config.playerCap) {
      const error = new Error('Game is full');
      handleGameError(error, res);
      return;
    }
    
    // Add new player
    const newPlayer = {
      playerId,
      name,
      class: playerClass || 'warrior',
      position: { 
        floor: GAME_CONFIG_CONSTANTS.DEFAULT_STARTING_FLOOR, 
        x: GAME_CONFIG_CONSTANTS.DEFAULT_SPAWN_X + 2, 
        y: GAME_CONFIG_CONSTANTS.DEFAULT_SPAWN_Y + 2 
      },
      moveSpeed: 5,
      health: 120,
      maxHealth: 120,
      level: 1,
      abilities: [],
      abilityCooldowns: {},
      nexusEchoes: [],
      inventory: [],
      joinedAt: new Date(),
    };
    
    game.players.push(newPlayer);
    game.playerCount = game.players.length;
    
    sendGameSuccess(res, game);
  } catch (error) {
    handleGameError(error as Error, res);
  }
});

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Real-time game state
const realtimeGameState = {
  players: new Map(),
  lastUpdate: Date.now(),
};

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-game', (data) => {
    console.log('Player joining game:', data);
    socket.join(data.gameId);
    
    // Add player to game state
    realtimeGameState.players.set(data.playerId, {
      playerId: data.playerId,
      name: data.playerName,
      position: { x: 10 + Math.random() * 10, y: 10 + Math.random() * 10 },
      velocity: { x: 0, y: 0 },
      health: 100,
      targetId: null,
    });
    
    socket.emit('connection-acknowledged', {
      playerId: data.playerId,
      gameId: data.gameId,
    });
  });
  
  socket.on('player-action', (data) => {
    // Rate limit WebSocket messages
    if (!checkWebSocketRateLimit(socket)) {
      return;
    }
    
    console.log('Player action:', data);
    
    // Extract action from payload
    const action = data.payload || data.action;
    if (!action) {
      console.error('No action found in player-action message:', data);
      return;
    }
    
    // Handle player movement
    if (action.type === 'MOVE_TO') {
      const player = realtimeGameState.players.get(data.playerId);
      if (player) {
        player.targetPosition = action.targetPosition;
        player.velocity = { x: 1, y: 1 }; // Simple movement
      }
    }

    // Handle targeting
    if (action.type === 'SET_TARGET') {
      const player = realtimeGameState.players.get(data.playerId);
      if (player) {
        player.targetId = action.targetId;
      }
    }
    
    io.to(data.gameId).emit('game-update', {
      players: Array.from(realtimeGameState.players.values()),
      enemies: [],
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Could remove player from realtimeGameState here
  });
});

// Game loop for real-time updates
setInterval(() => {
  // Update player positions
  realtimeGameState.players.forEach(player => {
    if (player.targetPosition) {
      // Simple movement toward target
      const dx = player.targetPosition.x - player.position.x;
      const dy = player.targetPosition.y - player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.1) {
        player.position.x += (dx / distance) * player.velocity.x * 0.033; // 30 FPS
        player.position.y += (dy / distance) * player.velocity.y * 0.033;
      } else {
        // Reached target
        player.targetPosition = null;
        player.velocity = { x: 0, y: 0 };
      }
    }
  });
  
  // Broadcast game state
  const state = {
    players: Array.from(realtimeGameState.players.values()),
    enemies: [],
  };
  
  io.emit('game-update', state);
}, 1000 / 30); // 30 FPS

// Handle malformed JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid JSON' }
    });
  }
  next(err);
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: { message: 'Internal server error' } 
  });
});

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: { message: 'Endpoint not found' }
  });
});

// Only start server if this file is run directly
if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Simple real-time server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready for connections`);
    console.log(`🎮 Game loop running at 30 FPS`);
  });
}

// Export for testing
export default app;
export { httpServer, io };