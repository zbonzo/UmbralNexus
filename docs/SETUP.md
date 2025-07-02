# Umbral Nexus - Developer Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- **Node.js 22+** and npm 9+
- **Docker** and Docker Compose
- **Git**

### Setup Steps

1. **Clone and install**
   ```bash
   git clone https://github.com/zbonzo/UmbralNexus.git
   cd UmbralNexus
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # The defaults work for local development
   ```

3. **Start databases**
   ```bash
   docker-compose up -d mongodb redis
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Verify everything works**
   ```bash
   # Run all tests (should see 5 test suites passing)
   npm test
   
   # Check the web app at http://localhost:5173 (should show "Coming Soon")
   # Check the server at http://localhost:3000/health (should return JSON)
   ```

## Development Workflow

### Running Tests
```bash
npm test                    # All tests across packages
npm run test:ci             # Tests with coverage
npm run test:e2e            # Cypress E2E tests
npm run test:e2e:open       # Open Cypress UI
```

### Code Quality
```bash
npm run lint                # Check linting
npm run lint:fix            # Fix auto-fixable issues
npm run type-check          # TypeScript compilation check
npm run format              # Format code with Prettier
```

### Package-specific development
```bash
# Web package (React/Vite)
npm run dev -w @umbral-nexus/web
npm run test -w @umbral-nexus/web
npm run storybook -w @umbral-nexus/web

# Server package (Express)  
npm run dev -w @umbral-nexus/server
npm run test -w @umbral-nexus/server

# Shared package (Types)
npm run build -w @umbral-nexus/shared
npm run test -w @umbral-nexus/shared
```

## Project Structure

```
umbral-nexus/
├── apps/web/               # React frontend (Vite + Vitest)
├── packages/server/        # Express backend (Jest)
├── packages/shared/        # Shared TypeScript types (Jest)
├── cypress/               # E2E tests
├── docker-compose.yml     # MongoDB + Redis
└── turbo.json            # Monorepo configuration
```

## Current Status

### ✅ What's Working
- **All tests passing** (5 test suites)
- **TypeScript compilation** across all packages
- **Development servers** with hot reload
- **Database setup** with MongoDB and Redis
- **Build system** with Turborepo

### 🔄 In Development
- Landing page UI components
- Game creation/joining interface
- WebSocket real-time communication

### 📝 Notes
- **Husky pre-commit hooks** are temporarily disabled on Windows due to PATH issues
- **"Coming Soon" page** is the current web app placeholder
- **Health endpoint** at `/health` returns server status and DB connection info

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker-compose ps
# Restart if needed
docker-compose restart mongodb
```

### Port Conflicts
- **Web**: http://localhost:5173
- **Server**: http://localhost:3000  
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

### Test Failures
```bash
# Clean install if packages seem out of sync
npm run clean
npm install
npm test
```

## Getting Help

- **Documentation**: Check `/docs` folder and markdown files in root
- **CLAUDE.md**: Comprehensive project guide for AI assistants
- **Architecture.md**: Technical architecture details
- **Checklist.md**: Development progress tracking

Ready to start Phase 1 development!