import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import type { 
  ClientMessage, 
  ServerMessage, 
  ClientMessageType, 
  ServerMessageType 
} from '@umbral-nexus/shared';

export interface PlayerConnection {
  playerId: string;
  gameId: string;
  socketId: string;
  joinedAt: Date;
  lastHeartbeat: Date;
}

export class ConnectionManager {
  private io: Server;
  private connections: Map<string, PlayerConnection> = new Map();
  private gameRooms: Map<string, Set<string>> = new Map();
  private heartbeatInterval: NodeJS.Timer;

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
    this.startHeartbeatMonitoring();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('join-game', (data: { gameId: string; playerId: string; playerName: string }) => {
        this.handleJoinGame(socket, data);
      });

      socket.on('leave-game', (data: { gameId: string; playerId: string }) => {
        this.handleLeaveGame(socket, data);
      });

      socket.on('player-action', (message: ClientMessage) => {
        this.handlePlayerAction(socket, message);
      });

      socket.on('heartbeat', () => {
        this.handleHeartbeat(socket);
      });

      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
        this.handleDisconnection(socket);
      });
    });
  }

  private handleJoinGame(socket: any, data: { gameId: string; playerId: string; playerName: string }): void {
    try {
      const { gameId, playerId, playerName } = data;
      
      // Remove any existing connection for this player
      this.removePlayerConnection(playerId);
      
      // Create new connection
      const connection: PlayerConnection = {
        playerId,
        gameId,
        socketId: socket.id,
        joinedAt: new Date(),
        lastHeartbeat: new Date(),
      };
      
      this.connections.set(playerId, connection);
      
      // Add to game room
      if (!this.gameRooms.has(gameId)) {
        this.gameRooms.set(gameId, new Set());
      }
      this.gameRooms.get(gameId)!.add(playerId);
      
      // Join socket room
      socket.join(gameId);
      
      // Acknowledge connection
      socket.emit('connection-acknowledged', {
        playerId,
        gameId,
        timestamp: new Date().toISOString(),
      });
      
      // Notify other players in the game
      socket.to(gameId).emit('player-joined', {
        playerId,
        playerName,
        timestamp: new Date().toISOString(),
      });
      
      logger.info(`Player ${playerId} joined game ${gameId}`);
    } catch (error) {
      logger.error('Error handling join game:', error);
      socket.emit('error', { 
        message: 'Failed to join game',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private handleLeaveGame(socket: any, data: { gameId: string; playerId: string }): void {
    try {
      const { gameId, playerId } = data;
      
      this.removePlayerConnection(playerId);
      
      // Leave socket room
      socket.leave(gameId);
      
      // Notify other players
      socket.to(gameId).emit('player-left', {
        playerId,
        timestamp: new Date().toISOString(),
      });
      
      logger.info(`Player ${playerId} left game ${gameId}`);
    } catch (error) {
      logger.error('Error handling leave game:', error);
    }
  }

  private handlePlayerAction(socket: any, message: ClientMessage): void {
    try {
      const connection = this.getConnectionBySocketId(socket.id);
      if (!connection) {
        socket.emit('error', { message: 'Player not connected to any game' });
        return;
      }

      // Update heartbeat
      connection.lastHeartbeat = new Date();
      
      // Broadcast action to game room (excluding sender)
      socket.to(connection.gameId).emit('player-action', {
        ...message,
        playerId: connection.playerId,
        timestamp: new Date().toISOString(),
      });

      // Acknowledge action
      socket.emit('action-acknowledged', {
        messageId: message.messageId,
        timestamp: new Date().toISOString(),
      });
      
      logger.debug(`Player action from ${connection.playerId}: ${message.type}`);
    } catch (error) {
      logger.error('Error handling player action:', error);
      socket.emit('error', { 
        message: 'Failed to process action',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private handleHeartbeat(socket: any): void {
    const connection = this.getConnectionBySocketId(socket.id);
    if (connection) {
      connection.lastHeartbeat = new Date();
      socket.emit('heartbeat-acknowledged');
    }
  }

  private handleDisconnection(socket: any): void {
    const connection = this.getConnectionBySocketId(socket.id);
    if (connection) {
      this.removePlayerConnection(connection.playerId);
      
      // Notify other players in the game
      socket.to(connection.gameId).emit('player-disconnected', {
        playerId: connection.playerId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private removePlayerConnection(playerId: string): void {
    const connection = this.connections.get(playerId);
    if (connection) {
      // Remove from game room
      const gameRoom = this.gameRooms.get(connection.gameId);
      if (gameRoom) {
        gameRoom.delete(playerId);
        if (gameRoom.size === 0) {
          this.gameRooms.delete(connection.gameId);
        }
      }
      
      this.connections.delete(playerId);
    }
  }

  private getConnectionBySocketId(socketId: string): PlayerConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.socketId === socketId) {
        return connection;
      }
    }
    return undefined;
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = 30000; // 30 seconds timeout
      
      for (const [playerId, connection] of this.connections.entries()) {
        if (now.getTime() - connection.lastHeartbeat.getTime() > timeout) {
          logger.warn(`Player ${playerId} timed out, removing connection`);
          this.removePlayerConnection(playerId);
          
          // Notify other players
          this.io.to(connection.gameId).emit('player-timeout', {
            playerId,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, 10000); // Check every 10 seconds
  }

  // Public methods for game logic
  public broadcastToGame(gameId: string, event: string, data: any): void {
    this.io.to(gameId).emit(event, data);
  }

  public sendToPlayer(playerId: string, event: string, data: any): void {
    const connection = this.connections.get(playerId);
    if (connection) {
      this.io.to(connection.socketId).emit(event, data);
    }
  }

  public getGamePlayerCount(gameId: string): number {
    return this.gameRooms.get(gameId)?.size || 0;
  }

  public getGamePlayers(gameId: string): string[] {
    return Array.from(this.gameRooms.get(gameId) || []);
  }

  public isPlayerConnected(playerId: string): boolean {
    return this.connections.has(playerId);
  }

  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.connections.clear();
    this.gameRooms.clear();
  }
}