import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = 8888;

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
  });
});

const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  httpServer.close(() => {
    process.exit(0);
  });
});