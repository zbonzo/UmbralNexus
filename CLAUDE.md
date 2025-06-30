# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Umbral Nexus is a browser-based cooperative roguelike dungeon crawler designed for large group play (1-20 players). Players use smartphones as controllers while viewing the game on a shared screen, creating a unique "party raid" experience that bridges mobile and console gaming. The project is currently in the planning and design phase with comprehensive documentation but no implementation yet.

### Vision Statement
Create the definitive large-group gaming experience that transforms any gathering into an epic cooperative adventure, accessible through any web browser without downloads or installations.

### Key Differentiators
- **Zero Friction Entry**: No app downloads, accounts, or setup required
- **Scalable Group Play**: Supports 1-20 players seamlessly  
- **Multi-Screen Architecture**: Separate controller, main view, and spectator screens
- **Progressive Difficulty**: Roguelike power-ups create exponential power growth
- **Social Spectacle**: Designed for streaming and spectator engagement

## Architecture & Technical Stack

### Monorepo Structure (from Architecture.md)
```
umbral-nexus/
├── .github/workflows/           # CI/CD pipelines
├── apps/
│   └── web/                    # React client application
│       ├── src/
│       │   ├── components/     # UI components
│       │   │   ├── common/     # Reusable components
│       │   │   ├── game/       # Game-specific components
│       │   │   └── layout/     # Layout components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── pages/          # Page components (routes)
│       │   ├── services/       # API and external services
│       │   ├── stores/         # Zustand stores
│       │   ├── styles/         # Global styles and themes
│       │   ├── types/          # TypeScript definitions
│       │   └── utils/          # Utility functions
├── packages/
│   ├── server/                 # Express server
│   │   ├── src/
│   │   │   ├── config/         # Configuration files
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── models/         # Mongoose models
│   │   │   ├── repositories/   # Data access layer
│   │   │   ├── services/       # Business logic
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── websocket/      # WebSocket handlers
│   │   │   └── game-engine/    # Core game logic
│   │   └── tests/              # Server tests
│   └── shared/                 # Shared types and utilities
│       └── src/
│           ├── constants/      # Shared constants
│           ├── types/          # TypeScript interfaces
│           ├── schemas/        # Validation schemas
│           └── utils/          # Shared utilities
├── tests/
│   ├── e2e/                   # Cypress E2E tests
│   └── integration/           # API integration tests
├── docs/                      # Documentation
├── scripts/                   # Build and deployment scripts
└── turbo.json                # Turborepo configuration
```

### Technology Stack

#### Frontend Stack
- **React 18+** with TypeScript
- **Vite** for build tooling
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations

#### Backend Stack
- **Node.js** with Express/Fastify
- **WebSocket server** (ws library)
- **Firebase/Firestore** for persistence
- **Redis** for session management (Phase 2)

#### Infrastructure
- **Self-hosted** with Docker and CasaOS
- **On-premises** deployment
- **GitHub Actions** for CI/CD
- **Cloudflare** for CDN/DDoS protection

#### Monitoring & Analytics
- **Sentry** for error tracking
- **Custom game analytics**
- **A/B testing framework**
- **ELK Stack** for logging and monitoring

## Development Commands

**Important**: The project is currently being migrated from a Turborepo starter template. The actual build commands are not yet established. When implementing, expect these commands based on the planned architecture:

### Root Commands (Turborepo)
```bash
# Development
npm run dev              # Start all development servers
npm run dev:client       # Start client development server
npm run dev:server       # Start server development server

# Building
npm run build            # Build all packages
npm run build:client     # Build client for production
npm run build:server     # Build server for production

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests with Cypress

# Code Quality
npm run lint             # Run ESLint across all packages
npm run lint:fix         # Fix linting issues
npm run type-check       # Run TypeScript compiler
npm run format           # Run Prettier formatting

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database to clean state
```

### Package-Specific Commands
```bash
# Client (apps/web)
cd apps/web
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run storybook        # Start Storybook

# Server (packages/server)
cd packages/server
npm run dev              # Start server with nodemon
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run test:load        # Run load tests
```

## Core Game Mechanics (from GameMechanics.md)

### Character Classes
**⚔️ Warrior** (Tank/Melee DPS)
- Starting HP: 120
- Abilities: Shield Bash (1 AP), Rallying Cry (2 AP), Whirlwind (3 AP)

**🏹 Ranger** (Ranged DPS/Scout)  
- Starting HP: 80
- Abilities: Quick Shot (1 AP), Mark Target (2 AP), Arrow Storm (3 AP)

**🔮 Mage** (AoE Damage/Control)
- Starting HP: 60
- Abilities: Frost Bolt (1 AP), Teleport (2 AP), Meteor (3 AP)

**✨ Cleric** (Support/Healer)
- Starting HP: 100
- Abilities: Heal (1 AP), Blessing (2 AP), Sanctuary (3 AP)

### Combat System
- **Action Points (AP)**: Each player gets 3 AP per turn
- **Turn Order**: All players act simultaneously, then enemies
- **30-second timer** for player actions
- **Action costs**: Move (1 AP/tile), Basic Attack (1 AP), Abilities (1-3 AP)
- **Damage Formula**: `Base Damage × Class Modifier × Equipment Bonus × Nexus Echo Multipliers`

### Status Effects
- **Stunned**: Skip next turn
- **Slowed**: -1 AP next turn  
- **Poisoned**: Take damage at turn start
- **Burning**: Take damage when moving
- **Frozen**: Cannot move (can still use abilities)
- **Blessed**: +50% damage reduction
- **Marked**: Take +50% damage from all sources

### Nexus Echoes (Power-ups)
**200+ unique power-ups** in categories:

**🗡️ Offensive Echoes**
- Bloodthirst: +5% damage per enemy killed (stacks)
- Chain Lightning: Attacks jump to nearby enemies
- Critical Surge: +10% crit chance, crits spread status effects
- Berserker: +100% damage when below 30% HP

**🛡️ Defensive Echoes**  
- Stone Skin: +2 damage reduction per floor cleared
- Dodge Master: 20% chance to avoid all damage
- Thorns: Reflect 50% melee damage
- Second Wind: Revive once per floor with 50% HP

**🎯 Utility Echoes**
- Swift Boots: +1 movement range
- Eagle Eye: +2 vision range, see through walls
- Treasure Hunter: Chests contain double loot
- Efficient: All abilities cost -1 AP (minimum 1)

**🌟 Legendary Echoes** (Rare)
- Nexus Attunement: +1 AP per turn
- Mirror Image: Create a copy that mimics your actions
- Time Warp: Take an extra turn after killing a boss
- Unity: Share 25% of your echoes' effects with allies

### Multi-Floor System
- **5 Floor Types**: Standard, Elite, Boss (every 5 floors), Secret, Nexus Core (final)
- **Split Party Mechanics**: Players can be on different floors simultaneously
- **Communication**: Between floors via emotes only
- **Darkness Mechanic**: Floors slowly fill with darkness, reducing vision and spawning enemies

## Functional Requirements (from PRD.md)

### Game Creation & Setup (FR-001 to FR-007)
- Host creates game with configurable parameters (player cap 1-20, victory conditions, difficulty)
- Unique 6-character GAMEID generation
- QR code generation for easy sharing
- Player joins via URL or GAMEID entry
- Character class selection (4 base classes minimum)
- Persistent connection with automatic reconnection
- Haptic feedback for actions (where supported)

### Exploration Mode (FR-008 to FR-011)
- Real-time movement via D-pad interface
- Multi-floor navigation with stair mechanics
- Fog of war shared across all players
- Item pickup and inventory management

### Combat Mode (FR-012 to FR-016)
- Zone-based combat initiation
- Action Point (AP) system (3 AP per turn)
- Ability targeting with valid target highlighting
- Turn order visualization
- Combat log with damage/effect notifications

### Progression System (FR-017 to FR-020)
- "Nexus Echo" power-up selection after boss defeats
- 3 random choices from 200+ unique power-ups
- Power-up stacking and synergy system
- Visual indication of active power-ups

### Multiplayer Features (FR-021 to FR-027)
- Main cast screen with intelligent camera
- Player-specific spectator screens
- Picture-in-picture for multi-floor combat
- Streamlined UI for broadcasting
- Quick emote system (8 emotes minimum)
- Ping system for location marking
- Ready check system for coordination

## Non-Functional Requirements (from PRD.md)

### Performance (NFR-001 to NFR-004)
- Support **20 concurrent players** per game instance
- **< 100ms input latency** (regional servers)
- **60 FPS** on cast screen (modern devices)
- **< 3 second** initial load time

### Scalability (NFR-005 to NFR-007)
- Support **1,000 concurrent game sessions**
- Horizontal scaling capability
- CDN integration for global distribution

### Reliability (NFR-008 to NFR-011)
- **99.9% uptime** SLA
- Automatic game state persistence
- Graceful degradation under load
- Player reconnection within 5 minutes

### Security (NFR-012 to NFR-015)
- No user data collection beyond session
- Rate limiting on all endpoints
- Input validation and sanitization
- WebSocket message authentication

### Accessibility (NFR-016 to NFR-020)
- **WCAG 2.1 AA compliance**
- Screen reader support
- Colorblind modes (3 options)
- Adjustable text size
- Reduced motion option

### Compatibility (NFR-021 to NFR-024)
- Chrome, Safari, Firefox, Edge support (2 latest versions)
- iOS Safari and Android Chrome support
- Responsive design (320px - 4K)
- Progressive enhancement for older devices

## Data Structures & Schemas

### Core Game State Interface
```typescript
interface GameState {
  id: string;
  config: GameConfig;
  players: Player[];
  floors: Floor[];
  currentPhase: 'lobby' | 'active' | 'victory' | 'defeat';
  startTime: number;
  endConditions: EndConditions;
}

interface Player {
  playerId: string;
  name: string;
  class: 'warrior' | 'ranger' | 'mage' | 'cleric';
  level: number;
  health: number;
  maxHealth: number;
  position: {
    floor: number;
    x: number;
    y: number;
  };
  joinedAt: Date;
  abilities: Ability[];
  nexusEchoes: NexusEcho[];
  inventory: Item[];
  actionPoints: number;
}

interface GameConfig {
  playerCap: number; // 1-20
  endConditions: {
    type: 'TIME_LIMIT' | 'DEATH_COUNT' | 'FLOOR_COUNT';
    value: number;
  };
  difficulty: 'normal' | 'hard' | 'nightmare';
}
```

### WebSocket Message Format
```typescript
interface ClientMessage {
  type: ClientMessageType;
  payload: unknown;
  timestamp: number;
  messageId: string; // For acknowledgment
}

interface ServerMessage {
  type: ServerMessageType;
  payload: unknown;
  timestamp: number;
  messageId?: string; // If acknowledging
}

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

## Development Workflow (from Checklist.md)

### Phase-Based Development Approach

**Phase 0: Project Initialization & Setup**
- Repository structure with workspaces
- Development environment with Docker Compose
- CI/CD pipeline with GitHub Actions
- MongoDB and Redis containerization

**Phase 1: UI Design & Component Tests**
- Design system setup with Tailwind + Radix UI
- Landing page UI & tests
- Game setup UI & tests  
- Player controller UI & tests
- Cast screen UI & tests
- Character selection UI & tests
- **Checkpoint 1**: All UI components render with mock data

**Phase 2: Shared Types & Utilities**  
- TypeScript interfaces for all game entities
- Zod validation schemas
- Utility functions for game calculations
- Unit tests for all utilities

**Phase 3: Backend Implementation**
- Express server setup with middleware
- MongoDB integration with Mongoose
- WebSocket server implementation  
- Game logic core with TurnManager
- Map generation algorithms
- AI system for enemies
- **Checkpoint 2**: Backend handles game creation and player connections

**Phase 4: Frontend-Backend Integration**
- API client with Axios
- Zustand state management
- WebSocket client with reconnection
- Real-time synchronization
- **Checkpoint 3**: Players can create, join, and play basic game

**Phase 5: Advanced Features**
- Nexus Echo power-up system (200+ effects)
- Multi-floor system with split-screen
- Spectator features
- Combat enhancements with targeting

**Phase 6: Polish & Optimization**
- Performance optimization (state diffing, message compression)
- Visual polish (animations, effects, transitions)
- Audio system with Howler.js
- Accessibility improvements

**Phase 7: Production Preparation**
- Security hardening (rate limiting, input sanitization)
- Database optimization and indexing
- Deployment setup with Docker
- Load testing (100+ concurrent connections)

**Phase 8: Monitoring & Analytics**
- Error tracking with Sentry
- Custom game analytics  
- ELK Stack for logging
- Real User Monitoring (RUM)
- End User Monitoring (EUM)
- Alerting system

**Phase 9: Launch Preparation**
- Documentation and tutorials
- Beta testing program
- Marketing preparation
- Final security audit

## Coding Standards & Conventions (from Architecture.md)

### File Naming Conventions
- **Components**: PascalCase - `PlayerController.tsx`
- **Hooks**: camelCase with 'use' prefix - `useGameState.ts`
- **Utilities**: camelCase - `calculateDamage.ts`
- **Types**: PascalCase - `GameTypes.ts`
- **Tests**: Same as source with `.test` - `PlayerController.test.tsx`
- **Stories**: Same as source with `.stories` - `Button.stories.tsx`
- **Constants**: UPPER_SNAKE_CASE filename - `GAME_CONSTANTS.ts`

### Variable Naming
```typescript
// Constants - UPPER_SNAKE_CASE
const MAX_PLAYERS = 20;
const DEFAULT_AP_COUNT = 3;

// Variables - camelCase  
let currentPlayer: Player;
const isGameActive = true;

// Enums - PascalCase with UPPER_SNAKE_CASE values
enum GamePhase {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS', 
  COMPLETED = 'COMPLETED'
}

// Interfaces - PascalCase with 'I' prefix for interfaces
interface IPlayer {
  id: string;
  name: string;
}
```

### Function Naming
```typescript
// Functions - camelCase, verb phrases
function calculateDamage(attacker: Player, target: Enemy): number {}
function validateMovement(from: Position, to: Position): boolean {}

// Event handlers - handle prefix
function handlePlayerMove(action: MoveAction): void {}
function handleWebSocketMessage(message: GameMessage): void {}

// Boolean returns - is/has/can prefix  
function isValidMove(move: Move): boolean {}
function hasEnoughAP(cost: number): boolean {}
function canTargetEnemy(enemy: Enemy): boolean {}
```

### ESLint Configuration
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
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
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-explicit-any': 'error',
    'complexity': ['error', 10],
    'max-depth': ['error', 3],
  },
};
```

## State Management Architecture

### Zustand Stores
```typescript
// stores/gameStore.ts - Main game state
interface GameStore {
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

// stores/playerStore.ts - Player-specific state
interface PlayerStore {
  playerId: string | null;
  playerClass: CharacterClass | null;
  actionPoints: number;
  selectedAbility: Ability | null;
  
  // Actions
  setPlayer: (id: string, class: CharacterClass) => void;
  useActionPoints: (cost: number) => void;
  selectAbility: (ability: Ability) => void;
}

// stores/uiStore.ts - UI state
interface UIStore {
  isConnected: boolean;
  currentScreen: 'landing' | 'lobby' | 'game' | 'victory';
  selectedTargets: string[];
  showCombatLog: boolean;
  
  // Actions  
  setConnectionStatus: (connected: boolean) => void;
  navigateToScreen: (screen: string) => void;
  toggleCombatLog: () => void;
}
```

## Testing Strategy

### Unit Testing (Jest + React Testing Library)
- **80% coverage minimum** for all packages
- Component testing with mock data
- Hook testing with act() wrapper
- Utility function testing with edge cases
- Store testing with state mutations

### Integration Testing  
- API endpoint testing with supertest
- WebSocket connection testing
- Database operations testing
- Game flow testing (create → join → play)

### E2E Testing (Cypress)
- Complete user journeys
- Multi-player scenarios  
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility testing

### Load Testing
- 100+ concurrent WebSocket connections
- 1000+ concurrent game sessions
- Database performance under load
- Memory leak detection
- Auto-scaling verification

## Security Implementation

### Input Validation (Zod Schemas)
```typescript
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

### Rate Limiting
```typescript
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

export const wsLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // limit each connection to 10 messages per second
});
```

## Performance Optimization

### React Performance
```typescript
// Use React.memo for expensive components
export const GameMap = React.memo<GameMapProps>(({ tiles, players }) => {
  // Component logic
}, (prevProps, nextProps) => {
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

### WebSocket Optimization
```typescript
// Message batching for 60 FPS updates
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

## Database Schema (MongoDB)

### Game Document Structure
```typescript
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
  host: String,
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
    nexusEchoes: [NexusEchoSchema],
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
  floors: [FloorSchema],
  currentFloor: Number,
  startedAt: Date,
  endedAt: Date,
}, {
  timestamps: true,
  optimisticConcurrency: true,
});

// Indexes for performance
gameSchema.index({ state: 1, createdAt: -1 });
gameSchema.index({ 'players.playerId': 1 });
gameSchema.index({ endedAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index
```

## Environment Configuration

### Environment Variables
```bash
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

# Game Configuration
MAX_PLAYERS_PER_GAME=20
MAX_CONCURRENT_GAMES=1000
GAME_STATE_TTL=86400

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
ELASTIC_CLOUD_ID=your-elastic-cloud-id
```

## Monitoring & Analytics

### Structured Logging
```typescript
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
});

// Usage examples
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

### Custom Metrics
```typescript
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
```

## Error Handling

### Custom Error Classes
```typescript
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

export class GameplayError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('GAMEPLAY_ERROR', message, 422, details);
  }
}
```

### Error Handling Middleware
```typescript
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log error with context
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

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

## Success Metrics & KPIs

### Launch Criteria (from PRD.md)
- **Week 1**: 1,000 games created
- **Month 1**: 10,000 unique players  
- **Month 3**: 50,000 total games played
- **Performance**: < 0.1% crash rate, 90% device compatibility
- **User Satisfaction**: 80% positive beta feedback

### Business Metrics
- **Adoption**: 10,000 unique games within 3 months
- **Engagement**: Average session length > 45 minutes
- **Retention**: 40% of groups play multiple sessions
- **Virality**: 30% of players introduce game to new groups

## Important Implementation Notes

### Server-Authoritative Architecture
- **All game logic runs on the server** - clients are display/input layers only
- **State synchronization** via WebSocket broadcasts to all connected clients
- **Input validation** on server using Zod schemas before processing
- **Anti-cheat** through server-side validation of all player actions

### Real-Time Performance Requirements  
- **60 FPS cast screen** - optimize React renders and WebSocket updates
- **< 100ms input latency** - minimize server processing time
- **Graceful degradation** - handle network issues and reconnection
- **Message batching** - batch updates for smooth 60 FPS experience

### Multi-Screen Coordination
- **Phone controllers** - touch-optimized D-pad and action buttons
- **Cast screen** - main game view optimized for large displays  
- **Spectator screens** - follow individual players or overview
- **Synchronized state** - all screens show consistent game state

### Content Scale Requirements
- **200+ Nexus Echo power-ups** - unique effects with stacking rules
- **Procedural generation** - 10+ floor templates, 5 themes
- **Enemy variety** - 20+ types with AI behaviors, 5+ bosses
- **Balancing system** - difficulty scaling based on player count

This comprehensive guide covers all the essential information from the project documentation and provides clear direction for implementing Umbral Nexus. The project is ambitious in scope but well-documented, requiring careful attention to real-time performance, multi-screen coordination, and scalable architecture.