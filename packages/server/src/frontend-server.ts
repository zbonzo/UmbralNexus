import express from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 8888;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", `http://localhost:${process.env.PORT || 8887}`, `ws://localhost:${process.env.PORT || 8887}`],
    },
  },
}));

// Compression middleware
app.use(compression());

// Serve static files from the React build directory
const buildPath = path.join(__dirname, '../web/dist');
app.use(express.static(buildPath));

// Health check for frontend server
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    service: 'frontend',
    timestamp: new Date().toISOString(),
  });
});

// Catch all handler - send React app for any route
app.get('*', (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start frontend server
if (process.env.NODE_ENV !== 'test') {
  app.listen(FRONTEND_PORT, () => {
    logger.info(`🌐 Frontend server running on http://localhost:${FRONTEND_PORT}`);
  });
}

export default app;