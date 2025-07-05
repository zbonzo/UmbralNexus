#!/bin/bash

echo "🚀 Starting Umbral Nexus Local Development Server"
echo "================================================"

# Build the current code
echo "📦 Building latest code..."
docker build -f Dockerfile.production -t umbralnexus-dev:latest .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Stop any existing dev container
echo "🧹 Cleaning up existing containers..."
docker stop umbral-dev 2>/dev/null || true
docker rm umbral-dev 2>/dev/null || true

# Start the databases if not running
echo "🗄️  Ensuring databases are running..."
docker run -d --name umbral-nexus-mongodb --network umbral-nexus-network -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=umbral-nexus-dev \
    -e MONGO_INITDB_DATABASE=umbral-nexus \
    mongo:7.0 2>/dev/null || echo "MongoDB already running"

docker run -d --name umbral-nexus-redis --network umbral-nexus-network -p 6379:6379 \
    redis:7-alpine redis-server --appendonly yes 2>/dev/null || echo "Redis already running"

# Start the development container
echo "🌐 Starting development server..."
docker run -d --name umbral-dev --network umbral-nexus-network \
    -p 5173:8888 -p 8887:8887 \
    -e NODE_ENV=development \
    -e PORT=8887 \
    -e FRONTEND_PORT=8888 \
    -e MONGODB_URI=mongodb://admin:umbral-nexus-dev@umbral-nexus-mongodb:27017/umbral-nexus?authSource=admin \
    -e REDIS_URL=redis://umbral-nexus-redis:6379 \
    -e CORS_ORIGIN=http://localhost:5173 \
    umbralnexus-dev:latest

echo ""
echo "✅ Development server started!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "⚙️  API:      http://localhost:8887"
echo ""
echo "📋 Useful commands:"
echo "   docker logs umbral-dev -f    # Follow logs"
echo "   docker stop umbral-dev       # Stop server"
echo "   ./dev-server.sh              # Restart with latest changes"
echo ""