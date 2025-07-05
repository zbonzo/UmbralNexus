#!/bin/bash

# Load NVM and use Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22 > /dev/null 2>&1 || nvm use default > /dev/null 2>&1

echo "🚀 Starting Umbral Nexus Development Environment"
echo "📋 Using Node.js $(node --version)"
echo "==============================================="

# Check if databases are running
echo "📋 Checking database status..."
if ! docker ps | grep -q umbral-nexus-mongodb; then
    echo "🗄️  Starting MongoDB..."
    docker run -d --name umbral-nexus-mongodb --network umbral-nexus-network -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=umbral-nexus-dev \
        -e MONGO_INITDB_DATABASE=umbral-nexus \
        mongo:7.0 2>/dev/null || echo "MongoDB already running"
else
    echo "✅ MongoDB is running"
fi

if ! docker ps | grep -q umbral-nexus-redis; then
    echo "🔗 Starting Redis..."
    docker run -d --name umbral-nexus-redis --network umbral-nexus-network -p 6379:6379 \
        redis:7-alpine redis-server --appendonly yes 2>/dev/null || echo "Redis already running"
else
    echo "✅ Redis is running"
fi

echo ""
echo "🌐 Starting development servers..."
echo ""
echo "Frontend: http://localhost:5173"
echo "API:      http://localhost:8887"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start development servers concurrently
{
    echo "🎨 Starting React development server..."
    cd apps/web && npm run dev
} &
FRONTEND_PID=$!

{
    echo "⚙️  Starting API development server..."
    cd packages/server && npm run dev
} &
API_PID=$!

# Wait for Ctrl+C
trap 'echo ""; echo "🛑 Shutting down development servers..."; kill $FRONTEND_PID $API_PID 2>/dev/null; exit 0' INT

# Wait for both processes
wait $FRONTEND_PID $API_PID