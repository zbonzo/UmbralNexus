import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { Player, Enemy, MoveToAction, SetTargetAction, AbilityAction } from '@umbral-nexus/shared';

const app = express();
const PORT = 8888;

// Game state storage
const games = new Map<string, GameInstance>();
const socketToPlayer = new Map<string, { gameId: string; playerId: string }>();

interface GameInstance {
  gameId: string;
  players: Map<string, Player>;
  enemies: Map<string, Enemy>;
  lastUpdate: number;
}

// Constants
const TICK_RATE = 1000 / 30; // 30 FPS
const MOVE_SPEED = 5; // Units per second

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Create game endpoint
app.post('/api/games', (req, res) => {
  console.log('Game creation requested:', req.body);
  
  const gameId = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  // Create new game instance
  const game: GameInstance = {
    gameId,
    players: new Map(),
    enemies: new Map(),
    lastUpdate: Date.now(),
  };
  
  // Add host player
  const hostPlayer: Player = {
    playerId: req.body.hostId || 'test-host',
    name: req.body.hostName || 'Host',
    class: 'warrior',
    position: { floor: 1, x: 10, y: 10 },
    moveSpeed: MOVE_SPEED,
    health: 120,
    maxHealth: 120,
    level: 1,
    abilities: getStartingAbilities('warrior'),
    abilityCooldowns: {},
    nexusEchoes: [],
    inventory: [],
    joinedAt: new Date(),
  };
  
  game.players.set(hostPlayer.playerId, hostPlayer);
  games.set(gameId, game);
  
  res.json({
    success: true,
    data: {
      gameId,
      name: req.body.name || 'Test Game',
      host: req.body.hostId || 'test-host',
      config: {
        playerCap: req.body.playerCap || 4,
        difficulty: req.body.difficulty || 'normal',
        endConditions: req.body.endConditions || { type: 'TIME_LIMIT', value: 3600 },
      },
      currentPhase: 'lobby',
      players: [hostPlayer],
      playerCount: 1,
      createdAt: new Date().toISOString(),
    },
  });
});

// Join game endpoint
app.post('/api/games/:gameId/join', (req, res) => {
  console.log('Game join requested:', { gameId: req.params.gameId, body: req.body });
  
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ success: false, error: 'Game not found' });
  }
  
  // Create new player
  const newPlayer: Player = {
    playerId: req.body.playerId,
    name: req.body.name,
    class: req.body.class || 'warrior',
    position: { 
      floor: 1, 
      x: 10 + game.players.size * 2, // Spawn players apart
      y: 10 + game.players.size * 2 
    },
    moveSpeed: MOVE_SPEED,
    health: getStartingHealth(req.body.class || 'warrior'),
    maxHealth: getStartingHealth(req.body.class || 'warrior'),
    level: 1,
    abilities: getStartingAbilities(req.body.class || 'warrior'),
    abilityCooldowns: {},
    nexusEchoes: [],
    inventory: [],
    joinedAt: new Date(),
  };
  
  game.players.set(newPlayer.playerId, newPlayer);
  
  res.json({
    success: true,
    data: {
      gameId: req.params.gameId,
      name: 'Test Game',
      host: Array.from(game.players.values())[0]?.playerId || 'unknown',
      config: {
        playerCap: 4,
        difficulty: 'normal',
        endConditions: { type: 'TIME_LIMIT', value: 3600 },
      },
      currentPhase: 'lobby',
      players: Array.from(game.players.values()),
      playerCount: game.players.size,
      createdAt: new Date().toISOString(),
    },
  });
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

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-game', (data) => {
    console.log('Player joining game:', data);
    socket.join(data.gameId);
    
    // Store socket-player mapping
    socketToPlayer.set(socket.id, {
      gameId: data.gameId,
      playerId: data.playerId,
    });
    
    socket.emit('connection-acknowledged', {
      playerId: data.playerId,
      gameId: data.gameId,
      timestamp: new Date().toISOString(),
    });
    
    // Send initial game state
    const game = games.get(data.gameId);
    if (game) {
      socket.emit('game-state', {
        players: Array.from(game.players.values()),
        enemies: Array.from(game.enemies.values()),
      });
    }
  });
  
  // Handle player actions
  socket.on('player-action', (message) => {
    const playerInfo = socketToPlayer.get(socket.id);
    if (!playerInfo) return;
    
    const game = games.get(playerInfo.gameId);
    if (!game) return;
    
    const player = game.players.get(playerInfo.playerId);
    if (!player) return;
    
    const action = message.payload;
    action.playerId = playerInfo.playerId;
    action.timestamp = Date.now();
    
    switch (action.type) {
      case 'MOVE_TO':
        handleMoveTo(player, action as MoveToAction);
        break;
      case 'SET_TARGET':
        handleSetTarget(player, action as SetTargetAction, game);
        break;
      case 'USE_ABILITY':
        handleUseAbility(player, action as AbilityAction, game, io);
        break;
      case 'STOP_MOVING':
        player.targetPosition = undefined;
        player.velocity = { x: 0, y: 0 };
        break;
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socketToPlayer.delete(socket.id);
  });
});

// Game loop
setInterval(() => {
  const now = Date.now();
  
  games.forEach((game, gameId) => {
    const deltaTime = (now - game.lastUpdate) / 1000; // Convert to seconds
    game.lastUpdate = now;
    
    // Update player positions
    game.players.forEach(player => {
      if (player.targetPosition && player.position) {
        const dx = player.targetPosition.x - player.position.x;
        const dy = player.targetPosition.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) { // Not at target yet
          // Calculate velocity
          const moveDistance = player.moveSpeed * deltaTime;
          const ratio = Math.min(moveDistance / distance, 1);
          
          player.position.x += dx * ratio;
          player.position.y += dy * ratio;
          
          player.velocity = {
            x: (dx / distance) * player.moveSpeed,
            y: (dy / distance) * player.moveSpeed,
          };
        } else {
          // Reached target
          player.targetPosition = undefined;
          player.velocity = { x: 0, y: 0 };
        }
      }
    });
    
    // Update enemies (placeholder)
    game.enemies.forEach(_enemy => {
      // TODO: Enemy AI
    });
    
    // Broadcast game state to all players in the game
    const gameState = {
      players: Array.from(game.players.values()).map(p => ({
        playerId: p.playerId,
        position: p.position,
        velocity: p.velocity,
        health: p.health,
        targetId: p.targetId,
        abilityCooldowns: p.abilityCooldowns,
      })),
      enemies: Array.from(game.enemies.values()),
    };
    
    io.to(gameId).emit('game-update', gameState);
  });
}, TICK_RATE);

// Action handlers
function handleMoveTo(player: Player, action: MoveToAction) {
  player.targetPosition = action.targetPosition;
  player.targetId = undefined; // Clear target when moving
}

function handleSetTarget(player: Player, action: SetTargetAction, game: GameInstance) {
  if (action.targetId === null) {
    player.targetId = undefined;
  } else {
    // Verify target exists
    if (action.targetType === 'player' && game.players.has(action.targetId)) {
      player.targetId = action.targetId;
    } else if (action.targetType === 'enemy' && game.enemies.has(action.targetId)) {
      player.targetId = action.targetId;
    }
  }
}

function handleUseAbility(player: Player, action: AbilityAction, game: GameInstance, io: Server) {
  const ability = player.abilities.find(a => a.id === action.abilityId);
  if (!ability) return;
  
  // Check cooldown
  const cooldownEnd = player.abilityCooldowns[ability.id] || 0;
  if (Date.now() < cooldownEnd) {
    console.log(`Ability ${ability.id} on cooldown for ${cooldownEnd - Date.now()}ms`);
    return;
  }
  
  // Check range if targeting
  if (action.targetId && player.targetId) {
    const target = game.players.get(player.targetId) || game.enemies.get(player.targetId);
    if (target && 'position' in target) {
      const distance = Math.sqrt(
        Math.pow(target.position.x - player.position.x, 2) +
        Math.pow(target.position.y - player.position.y, 2)
      );
      
      if (distance > ability.range) {
        console.log(`Target out of range: ${distance} > ${ability.range}`);
        return;
      }
    }
  }
  
  // Apply ability effect (simplified)
  console.log(`Player ${player.playerId} uses ${ability.name}`);
  
  // Set cooldown
  player.abilityCooldowns[ability.id] = Date.now() + ability.cooldownTime;
  
  // Broadcast ability use
  io.to(game.gameId).emit('ability-used', {
    playerId: player.playerId,
    abilityId: ability.id,
    targetId: action.targetId,
    targetPosition: action.targetPosition,
  });
}

// Helper functions
function getStartingHealth(characterClass: string): number {
  switch (characterClass) {
    case 'warrior': return 120;
    case 'ranger': return 80;
    case 'mage': return 60;
    case 'cleric': return 100;
    default: return 80;
  }
}

function getStartingAbilities(characterClass: string): any[] {
  switch (characterClass) {
    case 'warrior':
      return [
        { id: 'shield-bash', name: 'Shield Bash', range: 1, cooldownTime: 3000, damageOrHeal: 20, targetType: 'enemy' },
        { id: 'rallying-cry', name: 'Rallying Cry', range: 5, cooldownTime: 10000, targetType: 'self', areaOfEffect: 5 },
        { id: 'whirlwind', name: 'Whirlwind', range: 0, cooldownTime: 8000, damageOrHeal: 15, targetType: 'self', areaOfEffect: 2 },
      ];
    case 'ranger':
      return [
        { id: 'quick-shot', name: 'Quick Shot', range: 8, cooldownTime: 2000, damageOrHeal: 15, targetType: 'enemy' },
        { id: 'mark-target', name: 'Mark Target', range: 10, cooldownTime: 5000, targetType: 'enemy' },
        { id: 'arrow-storm', name: 'Arrow Storm', range: 6, cooldownTime: 12000, damageOrHeal: 10, targetType: 'ground', areaOfEffect: 3 },
      ];
    case 'mage':
      return [
        { id: 'frost-bolt', name: 'Frost Bolt', range: 6, cooldownTime: 2500, damageOrHeal: 25, targetType: 'enemy' },
        { id: 'teleport', name: 'Teleport', range: 8, cooldownTime: 6000, targetType: 'ground' },
        { id: 'meteor', name: 'Meteor', range: 10, cooldownTime: 15000, damageOrHeal: 40, targetType: 'ground', areaOfEffect: 2 },
      ];
    case 'cleric':
      return [
        { id: 'heal', name: 'Heal', range: 5, cooldownTime: 2000, damageOrHeal: 30, targetType: 'ally' },
        { id: 'blessing', name: 'Blessing', range: 4, cooldownTime: 8000, targetType: 'ally' },
        { id: 'sanctuary', name: 'Sanctuary', range: 0, cooldownTime: 20000, targetType: 'ground', areaOfEffect: 4 },
      ];
    default:
      return [];
  }
}

httpServer.listen(PORT, () => {
  console.log(`🚀 Real-time server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
  console.log(`🎮 Game loop running at 30 FPS`);
});

httpServer.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('SIGTERM', () => {
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});