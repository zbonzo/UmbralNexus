#!/bin/sh

# Start frontend server in background
echo "Starting frontend server on port ${FRONTEND_PORT:-8888}..."
node packages/server/dist/frontend-server.js &
FRONTEND_PID=$!

# Start API server
echo "Starting API server on port ${PORT:-8887}..."
node packages/server/dist/index.js &
API_PID=$!

# Wait for both processes
wait $FRONTEND_PID $API_PID