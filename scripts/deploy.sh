#!/bin/bash

# Deployment script for Umbral Nexus
set -e

# Configuration
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_HOST="${DEPLOY_HOST}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-~/umbral-nexus}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if required environment variables are set
if [ -z "$DEPLOY_HOST" ]; then
    print_error "DEPLOY_HOST environment variable is not set"
    exit 1
fi

print_status "Starting deployment to $DEPLOY_HOST"

# Build the application
print_status "Building application..."
npm ci
npm run build

# Build Docker images
print_status "Building Docker images..."
docker build -t umbral-nexus-server:latest -f packages/server/Dockerfile .
docker build -t umbral-nexus-client:latest -f apps/web/Dockerfile .

# Create deployment package
print_status "Creating deployment package..."
mkdir -p deployment-temp
cp docker-compose.prod.yml deployment-temp/docker-compose.yml
cp -r nginx deployment-temp/
cp -r apps/web/dist deployment-temp/client-build

# Create deployment archive
tar -czf deployment.tar.gz -C deployment-temp .
rm -rf deployment-temp

# Transfer files to server
print_status "Transferring files to server..."
scp -P $DEPLOY_PORT deployment.tar.gz $DEPLOY_USER@$DEPLOY_HOST:~/

# Deploy on server
print_status "Deploying on server..."
ssh -p $DEPLOY_PORT $DEPLOY_USER@$DEPLOY_HOST << 'ENDSSH'
set -e

# Create deployment directory
mkdir -p ~/umbral-nexus
cd ~/umbral-nexus

# Backup current deployment
if [ -d "current" ]; then
    echo "Backing up current deployment..."
    mv current backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new deployment
mkdir current
tar -xzf ~/deployment.tar.gz -C current/
rm ~/deployment.tar.gz

# Stop existing containers
cd current
docker-compose down || true

# Start new containers
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Health check
if curl -f http://localhost/health; then
    echo "Deployment successful!"
    
    # Clean up old backups (keep last 3)
    cd ..
    ls -dt backup-* 2>/dev/null | tail -n +4 | xargs rm -rf || true
else
    echo "Health check failed!"
    exit 1
fi
ENDSSH

# Clean up local files
rm -f deployment.tar.gz

print_status "Deployment completed successfully!"
print_status "Application should be available at http://$DEPLOY_HOST"