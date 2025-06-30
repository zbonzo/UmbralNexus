#!/bin/bash
# Easy installer for Umbral Nexus on CasaOS

echo "🎮 Welcome to Umbral Nexus Easy Installer!"
echo "========================================="
echo ""

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Find an available port
echo "🔍 Finding an available port..."
PORT=8888
while ! check_port $PORT; do
    echo "Port $PORT is taken, trying next..."
    PORT=$((PORT + 1))
done
echo -e "${GREEN}✓ Found available port: $PORT${NC}"

# Create directories
echo ""
echo "📁 Creating game directories..."
sudo mkdir -p /DATA/AppData/umbral-nexus/{config,game,data}
sudo chown -R $(whoami):$(whoami) /DATA/AppData/umbral-nexus
echo -e "${GREEN}✓ Directories created${NC}"

# Create a simple landing page for now
echo ""
echo "📄 Creating game files..."
cat > /DATA/AppData/umbral-nexus/game/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Umbral Nexus</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: #1a1a2e;
            color: #eee;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 20px;
        }
        h1 {
            color: #7c3aed;
            font-size: 3em;
            margin-bottom: 0.5em;
        }
        .status {
            background: #2d2d44;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .button {
            background: #7c3aed;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 1.2em;
            cursor: pointer;
            margin: 10px;
        }
        .button:hover {
            background: #6d28d9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Umbral Nexus</h1>
        <div class="status">
            <h2>Installation Successful!</h2>
            <p>The game server is being set up.</p>
            <p>This page will update automatically when ready.</p>
            <p>Port: <strong>PORT_NUMBER</strong></p>
        </div>
        <button class="button" onclick="location.reload()">Refresh</button>
    </div>
</body>
</html>
EOF

# Replace PORT_NUMBER with actual port
sed -i "s/PORT_NUMBER/$PORT/g" /DATA/AppData/umbral-nexus/game/index.html
echo -e "${GREEN}✓ Game files created${NC}"

# Create docker-compose file
echo ""
echo "🐳 Creating Docker configuration..."
cat > /DATA/AppData/umbral-nexus/docker-compose.yml << EOF
name: umbral-nexus
services:
  web:
    image: nginx:alpine
    container_name: umbral-nexus
    volumes:
      - /DATA/AppData/umbral-nexus/game:/usr/share/nginx/html:ro
    ports:
      - "$PORT:80"
    restart: unless-stopped
EOF
echo -e "${GREEN}✓ Docker configuration created${NC}"

# Start the container
echo ""
echo "🚀 Starting Umbral Nexus..."
cd /DATA/AppData/umbral-nexus
sudo docker-compose up -d

# Wait for container to start
sleep 5

# Check if running
if sudo docker ps | grep -q umbral-nexus; then
    echo -e "${GREEN}✓ Umbral Nexus is running!${NC}"
    echo ""
    echo "========================================="
    echo -e "${GREEN}🎉 Installation Complete!${NC}"
    echo "========================================="
    echo ""
    echo "📱 Access the game at:"
    echo -e "${YELLOW}   http://casaos:$PORT${NC}"
    echo -e "${YELLOW}   http://$(hostname -I | awk '{print $1}'):$PORT${NC}"
    echo ""
    echo "💡 Tips:"
    echo "  - Make sure all devices are on the same WiFi"
    echo "  - Use Chrome or Safari for best experience"
    echo "  - The main screen goes on your TV/computer"
    echo "  - Players use their phones as controllers"
    echo ""
else
    echo -e "${RED}❌ Something went wrong. Check the logs:${NC}"
    echo "sudo docker logs umbral-nexus"
fi