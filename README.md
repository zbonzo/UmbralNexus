# 🌌 Umbral Nexus

> **Link your raid. Cast your screen. Reconnect a shattered reality.**

Umbral Nexus is a cooperative, turn-based roguelike dungeon crawler designed for large groups (1-20 players). Using smartphones as controllers and a shared screen for viewing, it creates a unique "party raid" experience that's perfect for social gatherings, streaming events, and team-building activities.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## 🚧 Development Status

**Currently in active development!** 

### ✅ Phase 0 Complete - Foundation Setup
- **Testing Infrastructure**: Jest, Vitest, Cypress all configured and working
- **Database Setup**: MongoDB with Mongoose models, Redis configured
- **Development Environment**: Docker Compose, environment configuration
- **Build System**: Turborepo monorepo with TypeScript compilation
- **Code Quality**: ESLint, Prettier, Husky hooks (temporarily disabled on Windows)

### 🔄 Phase 1 In Progress - UI Design & Components
- Design system with Radix UI and Tailwind CSS
- Landing page and game creation/joining interface
- Basic WebSocket connection for real-time communication

### 🎮 Future Gameplay (When Complete)
1. **Create a Game**: One player creates a game and shares the 6-character code
2. **Join on Phone**: Other players visit the site on their phones and enter the code
3. **Cast to Screen**: Open `/cast/GAMEID` on a large screen to display the game
4. **Adventure Together**: Work as a team to conquer the Umbral Labyrinth!

## ✨ Key Features

### 🎯 Core Gameplay
- **Massive Multiplayer**: 1-20 players in a single game session
- **Phone Controllers**: Use any smartphone as a gamepad - no app download needed
- **Shared Screen**: Cast the game to any display for everyone to watch
- **Procedural Dungeons**: Every playthrough offers unique challenges
- **Roguelike Power-ups**: Collect "Nexus Echoes" that stack for explosive synergies

### 🎨 Technical Highlights
- **Zero Friction**: Join games instantly via web browser
- **Real-time Synchronization**: Seamless multiplayer powered by WebSockets
- **Responsive Design**: Works on any device, any screen size
- **Accessibility First**: WCAG 2.1 AA compliant with screen reader support
- **Stream-Ready**: Built-in spectator modes and streamer-friendly features

### 🏗️ Architecture
- **Server-Authoritative**: Cheat-proof game logic
- **Auto-Scaling**: Handles viral moments gracefully
- **State Persistence**: Rejoin games after disconnection
- **Performance Optimized**: 60 FPS gameplay with <100ms input latency

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast builds
- **Tailwind CSS** for responsive styling
- **Radix UI** for accessible components
- **Zustand** for state management
- **Framer Motion** for animations

### Backend
- **Node.js** with Express/Fastify
- **TypeScript** for type safety
- **WebSocket** for real-time communication
- **MongoDB** for game persistence
- **Redis** for session management
- **Zod** for validation

### Infrastructure
- **Turborepo** for monorepo management
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Self-hosted** with Docker and CasaOS
- **On-premises** deployment
- **ELK Stack** for monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB 6+
- Redis 7+ (optional for development)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zbonzo/umbral-nexus.git
   cd umbral-nexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start databases with Docker
   docker-compose up -d mongodb redis
   
   # Start all development servers
   npm run dev
   ```

   This starts:
   - Frontend at http://localhost:5173 (Currently shows "Coming Soon")
   - Backend at http://localhost:3000 (Health check available at /health)
   - MongoDB at mongodb://localhost:27017
   - Redis at redis://localhost:6379

5. **Verify setup is working**
   ```bash
   # Run all tests to verify everything is configured correctly
   npm test
   
   # Check backend health
   curl http://localhost:3000/health
   ```

## 📁 Project Structure

```
umbral-nexus/
├── apps/
│   └── web/                 # React frontend application
├── packages/
│   ├── server/              # Node.js backend server
│   └── shared/              # Shared types and utilities
├── tests/
│   ├── e2e/                 # End-to-end tests
│   └── integration/         # API integration tests
├── docs/                    # Documentation
└── scripts/                 # Build and deployment scripts
```

For detailed architecture information, see [Architecture.md](./docs/Architecture.md).

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Available test commands
```bash
npm run test             # Run all tests across packages
npm run test:ci          # Run tests with coverage in CI mode
npm run test:e2e         # Run Cypress E2E tests (configured but minimal tests)
npm run test:e2e:open    # Open Cypress test runner

# Package-specific tests
npm run test -w @umbral-nexus/web     # Web package (Vitest)
npm run test -w @umbral-nexus/server  # Server package (Jest)
npm run test -w @umbral-nexus/shared  # Shared package (Jest)
```

### Current test status
- ✅ **5 test suites passing** across all packages
- ✅ **Unit tests** for shared types and server health endpoints
- ✅ **React component tests** with React Testing Library
- ✅ **Cypress configured** for future E2E testing
- 🎯 **80% coverage threshold** configured for all packages

## 🎯 Development Workflow

### 1. Create a feature branch
```bash
git checkout -b feature/ISSUE-amazing-feature
```

### 2. Make your changes
Follow our coding standards in [Architecture.md](./docs/Architecture.md)

### 3. Write/update tests
Every new feature needs corresponding tests

### 4. Commit your changes
```bash
git commit -m "feat(component): add amazing feature"
```

### 5. Push and create PR
```bash
git push origin feature/ISSUE-amazing-feature
```

## 🚢 Deployment

### Staging Deployment
Merges to `develop` automatically deploy to staging:
- Frontend: https://staging.localhost (Domain TBD)
- Backend: https://api-staging.localhost (Domain TBD)

### Production Deployment
Merges to `main` automatically deploy to production:
- Frontend: https://localhost (Domain TBD)
- Backend: https://api.localhost (Domain TBD)

### Manual Deployment
```bash
# Deploy frontend
npm run deploy:frontend

# Deploy backend
npm run deploy:backend
```

## 📊 Monitoring

We use the ELK stack for comprehensive monitoring:

- **Elasticsearch**: Log aggregation and search
- **Logstash**: Log processing and enrichment
- **Kibana**: Visualization and dashboards


Key metrics tracked:
- Real User Monitoring (RUM)
- Game session analytics
- Performance metrics
- Error tracking with Sentry

## 🤝 Contributing

We love contributions!

### Quick Contribution Guide
1. Fork the repository
2. Create your feature branch
3. Follow our coding standards
4. Write tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📚 Documentation

- [Project Requirements Document (PRD)](./PRD.md)
- [Architecture & Standards](./Architecture.md)
- [Development Checklist](./Checklist.md)
- [API Documentation](./docs/api/README.md)
- [Game Mechanics Guide](./GameMechanics.md)

## 🎮 Game Design

### Core Loop
1. **Explore**: Navigate procedurally generated floors
2. **Combat**: Engage in tactical turn-based battles
3. **Upgrade**: Choose powerful Nexus Echoes after each boss
4. **Cooperate**: Coordinate with your team to overcome challenges

### Victory Conditions
Games can end through:
- **Time Limit**: Complete objectives before time runs out
- **Death Counter**: Limited team respawns
- **Floor Target**: Reach a specific dungeon depth

## 🌟 Development Roadmap

### ✅ Phase 0: Foundation Setup (COMPLETE)
- ✅ **Testing Infrastructure**: Jest, Vitest, Cypress all working
- ✅ **Database Setup**: MongoDB with Mongoose models, Redis configured  
- ✅ **Development Environment**: Docker Compose, environment configuration
- ✅ **Build System**: Turborepo monorepo with TypeScript compilation
- ✅ **Code Quality**: ESLint, Prettier, Git hooks

### 🔄 Phase 1: UI Design & Component Tests (IN PROGRESS)
- 📅 Design system setup with Tailwind + Radix UI
- 📅 Landing page UI & tests
- 📅 Game setup UI & tests
- 📅 Player controller UI & tests
- 📅 Cast screen UI & tests
- 📅 Character selection UI & tests

### 📅 Phase 2: Shared Types & Utilities
- TypeScript interfaces for all game entities
- Zod validation schemas
- Utility functions for game calculations
- Unit tests for all utilities

### 📅 Phase 3: Backend Implementation
- Express server setup with middleware
- MongoDB integration with Mongoose
- WebSocket server implementation
- Game logic core with TurnManager
- Map generation algorithms
- AI system for enemies

### 📅 Phase 4: Frontend-Backend Integration
- API client with Axios
- Zustand state management
- WebSocket client with reconnection
- Real-time synchronization

### 📅 Phase 5: Advanced Features
- Nexus Echo power-up system (200+ effects)
- Multi-floor system with split-screen
- Spectator features
- Combat enhancements with targeting

### 📅 Phase 6-9: Polish, Production, Monitoring & Launch
- Performance optimization, visual polish, security hardening
- Deployment setup, load testing, analytics integration
- Documentation, beta testing, launch preparation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the Umbral Nexus team
- Special thanks to our beta testers and early supporters
- Inspired by games like Torghast, Hades, and Jackbox

---

**Ready to raid?** Visit DOMAINTBD.com and start your adventure!

*The Nexus awaits...*