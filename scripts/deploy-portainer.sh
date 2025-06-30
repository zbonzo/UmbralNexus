#!/bin/bash

# Deploy script for Portainer/Docker setup
# Usage: ./deploy-portainer.sh [server-ip] [username]

SERVER=${1:-192.168.100.201}
USER=${2:-zac}
REMOTE_PATH="/home/$USER/umbral-nexus"

echo "🚀 Deploying Umbral Nexus to $USER@$SERVER"

# Create directory on remote server
echo "📁 Creating deployment directory..."
ssh $USER@$SERVER "mkdir -p $REMOTE_PATH"

# Copy docker-compose file
echo "📋 Copying docker-compose file..."
scp docker-compose.portainer.yml $USER@$SERVER:$REMOTE_PATH/docker-compose.yml

# Deploy on remote server
echo "🐳 Starting Docker containers..."
ssh $USER@$SERVER "cd $REMOTE_PATH && docker compose pull && docker compose up -d"

# Check status
echo "✅ Checking deployment status..."
ssh $USER@$SERVER "cd $REMOTE_PATH && docker compose ps"

echo "🎮 Deployment complete! Access at https://umbral.zb.wtf"