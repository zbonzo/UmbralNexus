# 🎮 Super Easy Setup Guide for Umbral Nexus on CasaOS

This guide will help you get Umbral Nexus running on your CasaOS server. We'll do this step-by-step!

## 📋 What You Need

- Your CasaOS server (casaos) 
- Your username (zac)
- About 10 minutes

## 🚀 Step-by-Step Setup

### Step 1: Connect to Your CasaOS Server

Open a terminal on your computer and type:

```bash
ssh zac@casaos
```

Enter your password when asked.

### Step 2: Create a Special User (Optional but Recommended)

This keeps things organized and secure:

```bash
# Create a new user for the game
sudo useradd -m -s /bin/bash umbral
sudo usermod -aG docker umbral

# Set a password for the new user
sudo passwd umbral
# (Type a password you'll remember)
```

### Step 3: Download the Game Files

Still in your terminal, run these commands:

```bash
# Go to your home folder
cd ~

# Download the game setup files
git clone https://github.com/yourusername/UmbralNexus.git
cd UmbralNexus
```

### Step 4: The Easy Way - Import to CasaOS

#### Option A: Through CasaOS Web Interface (Easiest!)

1. Open your web browser
2. Go to: `http://casaos:81` (or whatever port your CasaOS uses)
3. Click on "App Store"
4. Click the "+" button or "Import" button
5. Click "Import Docker Compose"
6. Copy and paste this simple version:

```yaml
name: umbral-nexus
services:
  umbral-nexus-all-in-one:
    image: zbonz/umbral-nexus:latest
    container_name: umbral-nexus-game
    restart: unless-stopped
    ports:
      - "8888:80"
    environment:
      - NODE_ENV=production
      - GAME_URL=http://casaos:8888
    volumes:
      - /DATA/AppData/umbral-nexus/data:/app/data
      - /DATA/AppData/umbral-nexus/saves:/app/saves
x-casaos:
  architectures:
    - amd64
    - arm64
  main: umbral-nexus-game
  category: Games
  port_map: "8888"
  title:
    en_us: Umbral Nexus Game
```

7. Click "Submit" or "Import"
8. Wait for it to download and start (about 2-3 minutes)

#### Option B: Command Line (If Web UI doesn't work)

```bash
# Make sure you're in the UmbralNexus folder
cd ~/UmbralNexus

# Copy the simple docker file to CasaOS
sudo cp casaos/docker-compose-simple.yml /DATA/AppData/umbral-nexus/docker-compose.yml

# Start it up
cd /DATA/AppData/umbral-nexus
sudo docker-compose up -d
```

### Step 5: First Time Setup

After the game starts:

1. Open your web browser
2. Go to: `http://casaos:8888`
3. You should see the Umbral Nexus main page!

### Step 6: Test the Game

1. On the main computer/TV, keep `http://casaos:8888` open
2. On your phone:
   - Connect to the same WiFi network
   - Open your phone's browser
   - Go to: `http://casaos:8888`
   - Click "Join Game"

## 🎯 Quick Troubleshooting

### "Can't connect to casaos:8888"

Try these URLs instead:
- `http://192.168.1.XXX:8888` (replace XXX with your server's IP)
- `http://localhost:8888` (if browsing from the server itself)

To find your server's IP:
```bash
ip addr show | grep inet
# Look for something like 192.168.1.100
```

### "Port 8888 is already in use"

Change to a different port:
1. In CasaOS, edit the app
2. Change `8888` to `9999` (or any free port)
3. Save and restart

### "Game won't start"

Check if it's running:
```bash
sudo docker ps | grep umbral
```

Check the logs:
```bash
sudo docker logs umbral-nexus-game
```

## 📱 Playing the Game

1. **Main Screen**: Open `http://casaos:8888` on your TV/computer
2. **Controllers**: Everyone opens `http://casaos:8888` on their phones
3. **Create Game**: One person clicks "Create Game" on the main screen
4. **Join**: Everyone else enters the game code on their phones

## 🔒 Security Notes

The game is only accessible on your local network. If you want to play with friends over the internet, you'll need to:

1. Set up port forwarding on your router
2. Use a service like Tailscale or ZeroTier
3. Or set up a reverse proxy with a domain name

## 🎉 That's It!

You should now have Umbral Nexus running on your CasaOS server! 

Remember:
- Game URL: `http://casaos:8888`
- All players need to be on the same WiFi
- The main screen shows the game world
- Phones are the controllers

Have fun playing!