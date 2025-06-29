# Deployment Guide for Umbral Nexus

This guide covers deploying Umbral Nexus to your own Ubuntu server running CasaOS.

## Prerequisites

- Ubuntu server (20.04 or newer) with CasaOS installed
- Docker and Docker Compose installed (comes with CasaOS)
- GitHub account for storing Docker images
- Domain name (optional, for public access)
- SSL certificate (optional, for HTTPS)

## Deployment Options

### Option 1: Automated Deployment via GitHub Actions

This is the recommended approach for continuous deployment.

#### 1. Set up GitHub Secrets

In your GitHub repository, go to Settings → Secrets and add:

- `SERVER_HOST`: Your server's IP address or domain
- `SERVER_USER`: SSH username (usually `ubuntu` or your username)
- `SERVER_SSH_KEY`: Private SSH key for authentication
- `SERVER_PORT`: SSH port (default: 22)
- `PRODUCTION_API_URL`: Your API URL (e.g., `https://yourdomain.com/api`)
- `PRODUCTION_WS_URL`: WebSocket URL (e.g., `wss://yourdomain.com`)

#### 2. Configure GitHub Container Registry

1. Create a Personal Access Token with `write:packages` permission
2. Enable GitHub Container Registry for your repository

#### 3. Deploy

Push to the `main` branch or manually trigger the workflow:

```bash
git push origin main
```

The GitHub Action will:
- Build Docker images
- Push to GitHub Container Registry
- Deploy to your server via SSH
- Run health checks

### Option 2: Manual Deployment

#### 1. Configure Environment

Create a `.env` file with your settings:

```bash
export DEPLOY_HOST="your-server-ip"
export DEPLOY_USER="ubuntu"
export DEPLOY_PORT="22"
```

#### 2. Run Deployment Script

```bash
source .env
./scripts/deploy.sh
```

### Option 3: CasaOS App Store Deployment

#### 1. Import to CasaOS

1. Copy `casaos/docker-compose.yml` to your server
2. In CasaOS web interface, go to App Store → Import
3. Select the docker-compose.yml file
4. Configure environment variables:
   - Set your domain/IP for CORS_ORIGIN
   - Adjust ports if needed

#### 2. Access the Game

After deployment, access the game at:
- `http://your-server-ip:8080` (default CasaOS port)

## Server Configuration

### Nginx Reverse Proxy (Optional)

If you want to use a custom domain with SSL:

1. Install Nginx on your host:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. Create Nginx configuration:
```nginx
server {
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable SSL:
```bash
sudo certbot --nginx -d yourdomain.com
```

### Firewall Configuration

Open required ports:

```bash
# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Game port (if not using reverse proxy)
sudo ufw allow 8080/tcp
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/umbral-nexus` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `CORS_ORIGIN` | Allowed origin for CORS | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MAX_PLAYERS_PER_GAME` | Max players per game | `20` |
| `MAX_CONCURRENT_GAMES` | Max concurrent games | `1000` |
| `GAME_STATE_TTL` | Game state TTL (seconds) | `86400` |

## Monitoring

### Health Checks

The application provides health endpoints:

- `/health` - Basic health check
- `/api/status` - Detailed status information

### Logs

View logs using Docker:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server

# CasaOS logs
docker logs umbral-nexus -f
```

### Resource Monitoring

Monitor resource usage:

```bash
# Docker stats
docker stats

# System resources
htop
```

## Backup and Recovery

### Backup MongoDB

```bash
# Create backup
docker exec umbral-nexus-db mongodump --out /backup
docker cp umbral-nexus-db:/backup ./mongodb-backup

# Restore backup
docker cp ./mongodb-backup umbral-nexus-db:/backup
docker exec umbral-nexus-db mongorestore /backup
```

### Backup Game Data

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="$HOME/umbral-nexus-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup MongoDB
docker exec umbral-nexus-db mongodump --archive > "$BACKUP_DIR/mongodb.archive"

# Backup Redis
docker exec umbral-nexus-redis redis-cli BGSAVE
docker cp umbral-nexus-redis:/data/dump.rdb "$BACKUP_DIR/redis.rdb"

# Keep only last 7 days of backups
find "$HOME/umbral-nexus-backups" -type d -mtime +7 -exec rm -rf {} +
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Check if ports are in use: `sudo netstat -tlnp | grep :8080`
   - Change ports in docker-compose.yml

2. **MongoDB connection issues**
   - Verify MongoDB is running: `docker ps | grep mongo`
   - Check logs: `docker logs umbral-nexus-db`

3. **WebSocket connection failures**
   - Ensure firewall allows WebSocket connections
   - Check Nginx proxy headers for WebSocket upgrade

4. **High memory usage**
   - Adjust Redis memory limit in docker-compose.yml
   - Monitor with: `docker stats`

### Debug Mode

Enable debug logging:

```bash
# In docker-compose.yml
environment:
  - NODE_ENV=development
  - DEBUG=umbral:*
```

## Performance Tuning

### MongoDB Optimization

```javascript
// Add indexes (run in MongoDB shell)
db.games.createIndex({ "gameId": 1 })
db.games.createIndex({ "state": 1, "createdAt": -1 })
db.games.createIndex({ "players.playerId": 1 })
```

### Redis Configuration

```conf
# redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### System Limits

```bash
# Increase file descriptors
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

## Security Considerations

1. **Use strong passwords** for MongoDB and Redis
2. **Enable firewall** and only open required ports
3. **Use HTTPS** for production deployments
4. **Regular updates** of Docker images and system packages
5. **Monitor logs** for suspicious activity

## Support

For issues or questions:
1. Check the [troubleshooting guide](#troubleshooting)
2. Review application logs
3. Open an issue on GitHub
4. Check CasaOS community forums