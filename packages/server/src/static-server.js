const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FRONTEND_PORT || 8888;
const buildPath = path.join(__dirname, '../web/dist');

console.log('Starting static server on port', PORT);
console.log('Serving files from:', buildPath);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);
  
  // Health check endpoint
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok',
      service: 'frontend',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Serve static files
  let filePath = path.join(buildPath, req.url === '/' ? 'index.html' : req.url);
  
  // For SPA routes, serve index.html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath = path.join(buildPath, 'index.html');
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error('File not found:', filePath);
      // Serve index.html for 404s (SPA fallback)
      fs.readFile(path.join(buildPath, 'index.html'), (err2, indexContent) => {
        if (err2) {
          res.writeHead(500);
          res.end('Server error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent);
        }
      });
    } else {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Static frontend server running on http://localhost:${PORT}`);
});