import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { ConnectionManager } from './connectionManager';
import { logger } from '../utils/logger';

export class WebSocketServer {
  private io: Server;
  private connectionManager: ConnectionManager;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Connection timeout settings
      pingTimeout: 60000,
      pingInterval: 25000,
      // Upgrade timeout
      upgradeTimeout: 10000,
      // Max HTTP buffer size
      maxHttpBufferSize: 1e6,
    });

    this.connectionManager = new ConnectionManager(this.io);
    
    // Socket.io event logging
    this.io.engine.on('connection_error', (err) => {
      logger.error('WebSocket connection error:', err);
    });

    logger.info('WebSocket server initialized');
  }

  public getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  public close(): void {
    this.connectionManager.disconnect();
    this.io.close();
    logger.info('WebSocket server closed');
  }
}