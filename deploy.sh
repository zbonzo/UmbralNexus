#!/bin/bash
set -e

echo "🚀 Deploying Umbral Nexus to apps server..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -f Dockerfile.production -t umbralnexus-server:latest .

# Save the image
echo "💾 Saving Docker image..."
docker save umbralnexus-server:latest | gzip > /tmp/umbralnexus-server.tar.gz

# Copy files to apps server
echo "📤 Copying files to apps server..."
scp -i ~/.ssh/id_ed25519 /tmp/umbralnexus-server.tar.gz zac@apps:/tmp/
scp -i ~/.ssh/id_ed25519 docker-compose.portainer.yml zac@apps:/tmp/docker-compose.yml

# Deploy on apps server
echo "🎯 Deploying on apps server..."
ssh -i ~/.ssh/id_ed25519 zac@apps << 'ENDSSH'
  # Load Docker image
  echo "Loading Docker image..."
  docker load < /tmp/umbralnexus-server.tar.gz
  
  # Create deployment directory
  mkdir -p ~/umbral-nexus
  
  # Move docker-compose file
  mv /tmp/docker-compose.yml ~/umbral-nexus/
  
  # Go to deployment directory
  cd ~/umbral-nexus
  
  # Stop existing containers
  docker compose down --remove-orphans || true
  
  # Start services
  docker compose up -d
  
  # Clean up
  rm -f /tmp/umbralnexus-server.tar.gz
  
  # Show status
  echo "✅ Deployment complete! Container status:"
  docker compose ps
ENDSSH

# Clean up local temp file
rm -f /tmp/umbralnexus-server.tar.gz

echo "🎉 Deployment finished! Your app should be available at https://umbral.zb.wtf"