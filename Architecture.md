# Umbral Nexus - Architecture & Standards Document

## 1. Project Structure

### 1.1 Monorepo Layout
```
umbral-nexus/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-client.yml
│       └── deploy-server.yml
├── apps/
│   └── web/                    # React client application
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── stores/
│       │   ├── styles/
│       │   ├── types/
│       │   ├── utils/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── server/                 # Express server
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── websocket/
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                 # Shared types and utilities
│       ├── src/
│       │   ├── constants/
│       │   ├── types/
│       │   ├── schemas/
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
├── tests/
│   ├── e2e/                    # Cypress E2E tests
│   └── integration/            # API integration tests
├── docs/
│   ├── api/
│   ├── architecture/
│   └── guides/
├── scripts/                    # Build and deployment scripts
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── package.json               # Root package.json with workspaces
├── tsconfig.base.json
└── turbo.json                # Turborepo configuration
```

### 1.2 Client Application Structure
```
apps/web/src/
├── components/
│   ├── common/               # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── game/                # Game-specific components
│   │   ├── CastScreen/
│   │   ├── PlayerController/
│   │   └── ...
│   └── layout/              # Layout components
├── hooks/                   # Custom React hooks
│   ├── useWebSocket.ts
│   ├── useGameState.ts
│   └── ...
├── pages/                   # Page components (routes)
│   ├── Landing.tsx
│   ├── Game.tsx
│   └── ...
├── services/               # API and external services
│   ├── api/
│   ├── websocket/
│   └── analytics/
├── stores/                 # Zustand stores
│   ├── gameStore.ts
│   ├── playerStore.ts
│   └── ...
├── styles/                # Global styles and themes
│   ├── globals.css
│   └── theme.ts
├── types/                 # TypeScript type definitions
└── utils/                # Utility functions
```

### 1.3 Server Application Structure
```
packages/server/src/
├── config/                # Configuration files
│   ├── database.ts
│   ├── redis.ts
│   └── constants.ts
├── controllers/          # Route controllers
│   ├── gameController.ts
│   └── ...
├── middleware/          # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── ...
├── models/             # Mongoose models
│   ├── Game.ts
│   ├── Player.ts
│   └── ...
├── repositories/       # Data access layer
│   ├── gameRepository.ts
│   └── ...
├── services/          # Business logic
│   ├── gameService.ts
│   ├── mapGenerator.ts
│   └── ...
├── utils/            # Utility functions
├── websocket/        # WebSocket handlers
│   ├── connectionManager.ts
│   ├── messageHandlers.ts
│   └── ...
└── game-engine/      # Core game logic
    ├── GameEngine.ts
    ├── CombatSystem.ts
    └── ...
```

## 2. Naming Conventions

### 2.1 File Naming
- **Components**: PascalCase - `PlayerController.tsx`
- **Hooks**: camelCase with 'use' prefix - `useGameState.ts`
- **Utilities**: camelCase - `calculateDamage.ts`
- **Types**: PascalCase - `GameTypes.ts`
- **Tests**: Same as source with `.test` - `PlayerController.test.tsx`
- **Stories**: Same as source with `.stories` - `Button.stories.tsx`
- **Styles**: kebab-case - `game-board.module.css`
- **Constants**: UPPER_SNAKE_CASE filename - `GAME_CONSTANTS.ts`

### 2.2 Variable Naming
```typescript
// Constants - UPPER_SNAKE_CASE
const MAX_PLAYERS = 20;
const DEFAULT_AP_COUNT = 3;

// Variables - camelCase
let currentPlayer: Player;
const isGameActive = true;

// Private class members - underscore prefix
private _gameState: GameState;

// Enums - PascalCase with UPPER_SNAKE_CASE values
enum GamePhase {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

// Interfaces/Types - PascalCase with 'I' prefix for interfaces
interface IPlayer {
  id: string;
  name: string;
}

type GameAction = 'MOVE' | 'ATTACK' | 'USE_ITEM';
```

### 2.3 Function Naming
```typescript
// Functions - camelCase, verb phrases
function calculateDamage(attacker: Player, target: Enemy): number {}
function validateMovement(from: Position, to: Position): boolean {}

// Event handlers - handle prefix
function handlePlayerMove(action: MoveAction): void {}
function handleWebSocketMessage(message: GameMessage): void {}

// Getters/Setters - get/set prefix
function getCurrentPlayer(): Player {}
function setGameState(state: GameState): void {}

// Boolean returns - is/has/can prefix
function isValidMove(move: Move): boolean {}
function hasEnoughAP(cost: number): boolean {}
function canTargetEnemy(enemy: Enemy): boolean {}
```

### 2.4 Component Naming
```typescript
// React Components - PascalCase
export const PlayerController: React.FC<PlayerControllerProps> = () => {}

// Props interfaces - ComponentNameProps
interface PlayerControllerProps {
  playerId: string;
  onAction: (action: GameAction) => void;
}

// Hook naming - use prefix
export function useGameConnection(gameId: string) {}
export function usePlayerState() {}
```

## 3. Code Style Standards

### 3.1 ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'promise',
    'unicorn',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'prettier',
  ],
  rules: {
    // TypeScript specific
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    
    // React specific
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import ordering
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    }],
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-nested-ternary': 'error',
    'complexity': ['error', 10],
    'max-depth': ['error', 3],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
```

### 3.2 Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "printWidth": 80,
        "proseWrap": "always"
      }
    }
  ]
}
```

### 3.3 TypeScript Configuration
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["packages/shared/src/*"],
      "@/*": ["src/*"]
    }
  }
}
```

## 4. Component Standards

### 4.1 React Component Structure
```typescript
// components/game/PlayerCard/PlayerCard.tsx
import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';

import type { Player } from '@shared/types';
import { Button } from '@/components/common';
import { formatHealth } from '@/utils/format';

import styles from './PlayerCard.module.css';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onSelect?: (playerId: string) => void;
  className?: string;
}

export const PlayerCard = memo<PlayerCardProps>(({ 
  player, 
  isActive, 
  onSelect,
  className 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onSelect?.(player.id);
  }, [player.id, onSelect]);

  return (
    <motion.div
      className={`${styles.card} ${className ?? ''}`}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Player ${player.name}`}
    >
      <h3>{player.name}</h3>
      <p>{formatHealth(player.health)}</p>
      {isActive && <span className={styles.activeIndicator}>Active</span>}
    </motion.div>
  );
});

PlayerCard.displayName = 'PlayerCard';
```

### 4.2 Hook Structure
```typescript
// hooks/useGameState.ts
import { useEffect, useRef, useCallback } from 'react';
import { shallow } from 'zustand/shallow';

import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from './useWebSocket';

interface UseGameStateOptions {
  gameId: string;
  playerId: string;
}

interface UseGameStateReturn {
  gameState: GameState | null;
  isLoading: boolean;
  error: Error | null;
  sendAction: (action: GameAction) => void;
}

export function useGameState({ 
  gameId, 
  playerId 
}: UseGameStateOptions): UseGameStateReturn {
  const { gameState, setGameState, setError } = useGameStore(
    (state) => ({
      gameState: state.gameState,
      setGameState: state.setGameState,
      setError: state.setError,
    }),
    shallow,
  );

  const { sendMessage, isConnected } = useWebSocket(gameId);

  const sendAction = useCallback((action: GameAction) => {
    if (!isConnected) {
      throw new Error('Not connected to game');
    }

    sendMessage({
      type: 'GAME_ACTION',
      payload: {
        playerId,
        action,
      },
    });
  }, [isConnected, playerId, sendMessage]);

  return {
    gameState,
    isLoading: !gameState && isConnected,
    error: null,
    sendAction,
  };
}
```

## 5. API Design Standards

### 5.1 RESTful Endpoints
```typescript
// HTTP Methods and naming
GET    /api/games              // List games
GET    /api/games/:id          // Get specific game
POST   /api/games              // Create game
PUT    /api/games/:id          // Update game
DELETE /api/games/:id          // Delete game

// Query parameters
GET    /api/games?status=active&limit=10&offset=0

// Nested resources
GET    /api/games/:gameId/players
POST   /api/games/:gameId/players
DELETE /api/games/:gameId/players/:playerId
```

### 5.2 Request/Response Format
```typescript
// Success response
{
  "success": true,
  "data": {
    "id": "ABC123",
    "name": "Epic Raid",
    "players": []
  },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "1.0.0"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game with ID ABC123 not found",
    "details": {
      "gameId": "ABC123"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### 5.3 WebSocket Message Format
```typescript
// Client to Server
interface ClientMessage {
  type: ClientMessageType;
  payload: unknown;
  timestamp: number;
  messageId: string; // For acknowledgment
}

// Server to Client
interface ServerMessage {
  type: ServerMessageType;
  payload: unknown;
  timestamp: number;
  messageId?: string; // If acknowledging
}

// Message types
enum ClientMessageType {
  JOIN_GAME = 'JOIN_GAME',
  LEAVE_GAME = 'LEAVE_GAME',
  PLAYER_ACTION = 'PLAYER_ACTION',
  HEARTBEAT = 'HEARTBEAT',
}

enum ServerMessageType {
  GAME_STATE = 'GAME_STATE',
  GAME_UPDATE = 'GAME_UPDATE',
  ERROR = 'ERROR',
  ACKNOWLEDGMENT = 'ACKNOWLEDGMENT',
}
```

## 6. State Management Patterns

### 6.1 Zustand Store Structure
```typescript
// stores/gameStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface GameState {
  // State
  gameId: string | null;
  gameState: GameStateData | null;
  players: Map<string, Player>;
  currentFloor: number;
  
  // Actions
  setGameId: (id: string) => void;
  updateGameState: (state: Partial<GameStateData>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  
  // Computed
  get activePlayerCount(): number;
}

export const useGameStore = create<GameState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      gameId: null,
      gameState: null,
      players: new Map(),
      currentFloor: 0,

      // Actions
      setGameId: (id) =>
        set((state) => {
          state.gameId = id;
        }),

      updateGameState: (newState) =>
        set((state) => {
          if (state.gameState) {
            Object.assign(state.gameState, newState);
          }
        }),

      addPlayer: (player) =>
        set((state) => {
          state.players.set(player.id, player);
        }),

      removePlayer: (playerId) =>
        set((state) => {
          state.players.delete(playerId);
        }),

      // Computed
      get activePlayerCount() {
        return Array.from(get().players.values()).filter(
          (p) => p.status === 'active'
        ).length;
      },
    }))
  )
);
```

## 7. Error Handling Patterns

### 7.1 Custom Error Classes
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with ID ${id} not found`, 404, { resource, id });
  }
}

export class GameplayError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('GAMEPLAY_ERROR', message, 422, details);
  }
}
```

### 7.2 Error Handling Middleware
```typescript
// middleware/errorHandler.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log error
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      user: req.user,
    },
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle validation errors from libraries
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

## 8. Testing Standards

### 8.1 Unit Test Structure
```typescript
// components/game/PlayerCard/PlayerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlayerCard } from './PlayerCard';
import { mockPlayer } from '@/test-utils/mocks';

describe('PlayerCard', () => {
  const defaultProps = {
    player: mockPlayer(),
    isActive: false,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders player information correctly', () => {
    render(<PlayerCard {...defaultProps} />);
    
    expect(screen.getByText(defaultProps.player.name)).toBeInTheDocument();
    expect(screen.getByText(/100\/100 HP/)).toBeInTheDocument();
  });

  it('shows active indicator when player is active', () => {
    render(<PlayerCard {...defaultProps} isActive />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    render(<PlayerCard {...defaultProps} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(defaultProps.player.id);
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<PlayerCard {...defaultProps} />);
    
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(defaultProps.onSelect).toHaveBeenCalled();
  });
});
```

### 8.2 Integration Test Structure
```typescript
// tests/integration/gameFlow.test.ts
import request from 'supertest';
import { Server } from 'socket.io';
import Client from 'socket.io-client';

import { app } from '@/app';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { createMockGame } from '@/test-utils/factories';

describe('Game Flow Integration', () => {
  let server: Server;
  let gameId: string;

  beforeAll(async () => {
    await connectDatabase();
    server = app.listen(0);
  });

  afterAll(async () => {
    server.close();
    await disconnectDatabase();
  });

  describe('Creating and joining a game', () => {
    it('allows a host to create a game', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({
          name: 'Test Game',
          playerCap: 4,
          endConditions: {
            type: 'TIME_LIMIT',
            value: 3600,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.playerCap).toBe(4);
      
      gameId = response.body.data.id;
    });

    it('allows players to join via WebSocket', (done) => {
      const client = Client(`http://localhost:${server.address().port}`, {
        query: { gameId },
      });

      client.on('connect', () => {
        client.emit('JOIN_GAME', {
          playerId: 'player1',
          playerName: 'Test Player',
        });
      });

      client.on('GAME_STATE', (data) => {
        expect(data.players).toHaveLength(1);
        expect(data.players[0].name).toBe('Test Player');
        client.close();
        done();
      });
    });
  });
});
```

## 9. Security Standards

### 9.1 Input Validation
```typescript
// schemas/gameSchemas.ts
import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().min(1).max(50),
  playerCap: z.number().int().min(1).max(20),
  endConditions: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('TIME_LIMIT'),
      value: z.number().int().min(300).max(7200), // 5 min to 2 hours
    }),
    z.object({
      type: z.literal('DEATH_COUNT'),
      value: z.number().int().min(1).max(100),
    }),
  ]),
});

export const playerActionSchema = z.object({
  playerId: z.string().uuid(),
  action: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('MOVE'),
      direction: z.enum(['up', 'down', 'left', 'right']),
    }),
    z.object({
      type: z.literal('ATTACK'),
      targetId: z.string().uuid(),
      abilityId: z.string(),
    }),
  ]),
});
```

### 9.2 Rate Limiting
```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

export const wsLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:ws:',
  }),
  windowMs: 1000, // 1 second
  max: 10, // limit each connection to 10 messages per second
  skipSuccessfulRequests: false,
});
```

## 10. Performance Standards

### 10.1 React Performance
```typescript
// Use React.memo for expensive components
export const GameMap = React.memo<GameMapProps>(({ tiles, players }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.tiles === nextProps.tiles && 
         prevProps.players.length === nextProps.players.length;
});

// Use useMemo for expensive calculations
const visibleTiles = useMemo(() => {
  return calculateVisibleTiles(playerPosition, tiles);
}, [playerPosition, tiles]);

// Use useCallback for stable function references
const handlePlayerMove = useCallback((direction: Direction) => {
  sendAction({ type: 'MOVE', direction });
}, [sendAction]);
```

### 10.2 WebSocket Optimization
```typescript
// Message batching
class MessageBatcher {
  private queue: ServerMessage[] = [];
  private timeout: NodeJS.Timeout | null = null;

  constructor(
    private send: (messages: ServerMessage[]) => void,
    private delay: number = 16 // ~60fps
  ) {}

  add(message: ServerMessage): void {
    this.queue.push(message);
    
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  }

  flush(): void {
    if (this.queue.length > 0) {
      this.send(this.queue);
      this.queue = [];
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
```

## 11. Database Schema Standards

### 11.1 MongoDB Schema Design
```typescript
// models/Game.ts
import { Schema, model, Document } from 'mongoose';

interface IGame extends Document {
  gameId: string;
  name: string;
  host: string;
  players: IPlayer[];
  config: IGameConfig;
  state: GameState;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

const gameSchema = new Schema<IGame>({
  gameId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  host: {
    type: String,
    required: true,
  },
  players: [{
    playerId: String,
    name: String,
    class: String,
    level: Number,
    health: Number,
    maxHealth: Number,
    position: {
      floor: Number,
      x: Number,
      y: Number,
    },
    joinedAt: Date,
  }],
  config: {
    playerCap: {
      type: Number,
      min: 1,
      max: 20,
    },
    endConditions: {
      type: {
        type: String,
        enum: ['TIME_LIMIT', 'DEATH_COUNT', 'FLOOR_COUNT'],
      },
      value: Number,
    },
  },
  state: {
    type: String,
    enum: ['LOBBY', 'IN_PROGRESS', 'COMPLETED'],
    default: 'LOBBY',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: Date,
  endedAt: Date,
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

// Indexes
gameSchema.index({ state: 1, createdAt: -1 });
gameSchema.index({ 'players.playerId': 1 });
gameSchema.index({ endedAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index

export const Game = model<IGame>('Game', gameSchema);
```

## 12. Git Conventions

### 12.1 Branch Naming
```
main                    # Production branch
develop                 # Development branch
feature/ISSUE-desc      # Feature branches
bugfix/ISSUE-desc       # Bug fix branches
hotfix/ISSUE-desc       # Hotfix branches
release/v1.0.0          # Release branches
```

### 12.2 Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>

# Examples:
feat(player): add ability to use items during combat
fix(websocket): resolve reconnection race condition
docs(api): update game creation endpoint documentation
perf(map): optimize fog of war calculations
test(combat): add integration tests for damage calculation
```

### 12.3 Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Maintenance tasks

## 13. Documentation Standards

### 13.1 Code Documentation
```typescript
/**
 * Calculates damage dealt from attacker to target
 * 
 * @param attacker - The entity dealing damage
 * @param target - The entity receiving damage
 * @param ability - The ability being used
 * @returns The final damage amount after all modifiers
 * 
 * @example
 * const damage = calculateDamage(player, enemy, fireball);
 * // Returns: 45
 * 
 * @throws {GameplayError} If ability cannot target the entity
 */
export function calculateDamage(
  attacker: CombatEntity,
  target: CombatEntity,
  ability: Ability
): number {
  // Implementation
}
```

### 13.2 API Documentation
```typescript
/**
 * @api {post} /api/games Create Game
 * @apiName CreateGame
 * @apiGroup Games
 * @apiVersion 1.0.0
 * 
 * @apiDescription Creates a new game session with specified configuration
 * 
 * @apiBody {String} name Game name (1-50 characters)
 * @apiBody {Number} playerCap Maximum players (1-20)
 * @apiBody {Object} endConditions Victory/defeat conditions
 * 
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Game data
 * @apiSuccess {String} data.id Unique game ID
 * @apiSuccess {String} data.joinCode 6-character join code
 * 
 * @apiError {Boolean} success Always false
 * @apiError {Object} error Error details
 * @apiError {String} error.code Error code
 * @apiError {String} error.message Human-readable message
 */
```

## 14. Monitoring & Logging Standards

### 14.1 Structured Logging
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'umbral-nexus',
    version: process.env.APP_VERSION,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Usage
logger.info('Game created', {
  gameId: game.id,
  playerCap: game.playerCap,
  host: req.user.id,
});

logger.error('Failed to process game action', {
  error: err,
  gameId,
  playerId,
  action,
});
```

### 14.2 Metrics Collection
```typescript
// monitoring/metrics.ts
import { Counter, Histogram, register } from 'prom-client';

export const gameCreatedCounter = new Counter({
  name: 'umbral_games_created_total',
  help: 'Total number of games created',
  labelNames: ['player_cap'],
});

export const actionProcessingDuration = new Histogram({
  name: 'umbral_action_processing_duration_seconds',
  help: 'Duration of game action processing',
  labelNames: ['action_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

export const activePlayersGauge = new Gauge({
  name: 'umbral_active_players',
  help: 'Current number of active players',
});

register.registerMetric(gameCreatedCounter);
register.registerMetric(actionProcessingDuration);
register.registerMetric(activePlayersGauge);
```

## 15. Environment Configuration

### 15.1 Environment Variables
```bash
# .env.example
# Application
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/umbral-nexus
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173

# External Services
SENTRY_DSN=https://your-sentry-dsn
ANALYTICS_KEY=your-analytics-key

# Game Configuration
MAX_PLAYERS_PER_GAME=20
MAX_CONCURRENT_GAMES=1000
GAME_STATE_TTL=86400

# Monitoring
ELASTIC_CLOUD_ID=your-elastic-cloud-id
ELASTIC_API_KEY=your-elastic-api-key
```

### 15.2 Configuration Management
```typescript
// config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    env: z.enum(['development', 'staging', 'production']),
    port: z.number().int().positive(),
    version: z.string(),
  }),
  database: z.object({
    mongoUri: z.string().url(),
    redisUrl: z.string().url(),
  }),
  security: z.object({
    jwtSecret: z.string().min(32),
    corsOrigin: z.string().url(),
  }),
  game: z.object({
    maxPlayersPerGame: z.number().int().min(1).max(50),
    maxConcurrentGames: z.number().int().positive(),
    gameStateTTL: z.number().int().positive(),
  }),
});

export const config = configSchema.parse({
  app: {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT ?? '3000'),
    version: process.env.APP_VERSION,
  },
  database: {
    mongoUri: process.env.MONGODB_URI,
    redisUrl: process.env.REDIS_URL,
  },
  // ... etc
});
```