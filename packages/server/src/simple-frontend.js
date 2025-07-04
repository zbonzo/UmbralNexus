const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 8888;

// Compression middleware
app.use(compression());

// Serve static files from the React build directory
const buildPath = path.join(__dirname, '../web/dist');
console.log('Serving static files from:', buildPath);

app.use(express.static(buildPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'frontend',
    timestamp: new Date().toISOString(),
  });
});

// Catch all handler - send React app for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start frontend server
app.listen(FRONTEND_PORT, () => {
  console.log(`🌐 Frontend server running on http://localhost:${FRONTEND_PORT}`);
});