import { io, Socket } from 'socket.io-client';
import type { GameState } from '@umbral-nexus/shared';

export interface RealTimeEvents {
  'connection-acknowledged': (data: { playerId: string; gameId: string; timestamp: string }) => void;
  'player-joined': (data: { playerId: string; playerName: string; timestamp: string }) => void;
  'player-left': (data: { playerId: string; timestamp: string }) => void;
  'player-disconnected': (data: { playerId: string; timestamp: string }) => void;
  'player-timeout': (data: { playerId: string; timestamp: string }) => void;
  'game-state': (state: GameState) => void;
  'game-started': (data: { gameId: string; startTime: number; timestamp: string }) => void;
  'error': (error: { message: string; details?: any }) => void;
  'action-acknowledged': (data: { messageId: string; timestamp: string }) => void;
  'heartbeat-acknowledged': () => void;
  'player-position': (data: { playerId: string; position: { floor: number; x: number; y: number }; velocity?: { x: number; y: number } }) => void;
  'game-update': (data: { players: any[]; enemies: any[] }) => void;
}

export interface PlayerActionData {
  type: 'MOVE_TO' | 'SET_TARGET' | 'USE_ABILITY' | 'USE_ITEM' | 'STOP_MOVING';
  targetPosition?: { x: number; y: number };
  targetId?: string | null;
  targetType?: 'player' | 'enemy';
  abilityId?: string;
  itemId?: string;
  messageId?: string;
}

export class RealTimeClient {
  private socket: Socket | null = null;
  private url: string;
  private currentGameId: string | null = null;
  private currentPlayerId: string | null = null;
  private eventHandlers: Map<keyof RealTimeEvents, Function[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string = `http://${window.location.hostname}:8888`) {
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.startHeartbeat();
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          this.stopHeartbeat();
        });

        this.socket.on('reconnect', () => {
          console.log('Reconnected to server');
          // Rejoin game if we were in one
          if (this.currentGameId && this.currentPlayerId) {
            this.joinGame(this.currentGameId, this.currentPlayerId, 'Reconnected Player');
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        // Set up event listeners for all backend events
        this.setupEventListeners();

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentGameId = null;
    this.currentPlayerId = null;
  }

  async joinGame(gameId: string, playerId: string, playerName: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    this.currentGameId = gameId;
    this.currentPlayerId = playerId;

    this.socket.emit('join-game', {
      gameId,
      playerId,
      playerName,
    });
  }

  async leaveGame(): Promise<void> {
    if (!this.socket || !this.currentGameId || !this.currentPlayerId) {
      return;
    }

    this.socket.emit('leave-game', {
      gameId: this.currentGameId,
      playerId: this.currentPlayerId,
    });

    this.currentGameId = null;
    this.currentPlayerId = null;
  }

  sendPlayerAction(action: PlayerActionData): void {
    if (!this.socket || !this.currentGameId || !this.currentPlayerId) {
      throw new Error('Not connected to a game');
    }

    const message = {
      type: 'PLAYER_ACTION',
      payload: action,
      timestamp: Date.now(),
      messageId: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.socket.emit('player-action', message);
  }

  // Event handler registration
  on<K extends keyof RealTimeEvents>(event: K, handler: RealTimeEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler as Function);
  }

  off<K extends keyof RealTimeEvents>(event: K, handler: RealTimeEvents[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as Function);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  getCurrentPlayerId(): string | null {
    return this.currentPlayerId;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connection-acknowledged', (data) => {
      this.emit('connection-acknowledged', data);
    });

    // Player events
    this.socket.on('player-joined', (data) => {
      this.emit('player-joined', data);
    });

    this.socket.on('player-left', (data) => {
      this.emit('player-left', data);
    });

    this.socket.on('player-disconnected', (data) => {
      this.emit('player-disconnected', data);
    });

    this.socket.on('player-timeout', (data) => {
      this.emit('player-timeout', data);
    });

    // Game events
    this.socket.on('game-state', (state) => {
      this.emit('game-state', state);
    });

    this.socket.on('game-started', (data) => {
      this.emit('game-started', data);
    });

    // Position updates
    this.socket.on('player-position', (data) => {
      this.emit('player-position', data);
    });

    // Real-time game updates
    this.socket.on('game-update', (data) => {
      this.emit('game-update', data);
    });

    // Action events
    this.socket.on('action-acknowledged', (data) => {
      this.emit('action-acknowledged', data);
    });

    // Error events
    this.socket.on('error', (error) => {
      this.emit('error', error);
    });

    // Heartbeat
    this.socket.on('heartbeat-acknowledged', () => {
      this.emit('heartbeat-acknowledged');
    });
  }

  private emit<K extends keyof RealTimeEvents>(event: K, ...args: Parameters<RealTimeEvents[K]>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat');
      }
    }, 25000); // Send heartbeat every 25 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}