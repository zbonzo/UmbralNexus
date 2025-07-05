import { io, Socket } from 'socket.io-client';
import type { SocketMessage, SocketOptions } from '@umbral-nexus/shared';

export type { SocketMessage, SocketOptions };

export class SocketClient {
  private socket: Socket | null = null;
  private url: string;
  private messageQueue: { message: SocketMessage; options: SocketOptions }[] = [];
  private messageHandlers: ((message: SocketMessage) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];
  private reconnectHandlers: (() => void)[] = [];
  private connectionHandlers: (() => void)[] = [];

  constructor(url: string) {
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
          randomizationFactor: 0.5,
          timeout: 20000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          this.processMessageQueue();
          this.notifyConnectionHandlers();
          resolve();
        });

        this.socket.on('message', (data: SocketMessage) => {
          this.handleMessage(data);
        });

        this.socket.on('game-message', (data: SocketMessage) => {
          this.handleMessage(data);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          // Socket.IO will automatically attempt reconnection
        });

        this.socket.on('reconnect', () => {
          console.log('Socket reconnected');
          this.processMessageQueue();
          this.notifyReconnectHandlers();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.notifyErrorHandlers(new Error(`Connection failed: ${error.message}`));
          reject(error);
        });

        this.socket.on('error', (error) => {
          this.notifyErrorHandlers(new Error(`Socket error: ${error}`));
        });

        // Handle heartbeat internally
        this.socket.on('heartbeat', () => {
          this.socket?.emit('heartbeat-ack');
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  send(message: SocketMessage, options: SocketOptions = {}): void {
    this.validateMessage(message);

    if (!this.isConnected() && options.queue) {
      this.messageQueue.push({ message, options });
      return;
    }

    if (!this.isConnected()) {
      throw new Error('Socket is not connected');
    }

    const messageWithMetadata = {
      ...message,
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };

    if (options.acknowledgment) {
      this.socket!.emit('game-message', messageWithMetadata, (ack: any) => {
        if (ack.error) {
          this.notifyErrorHandlers(new Error(ack.error));
        }
      });
    } else {
      this.socket!.emit('game-message', messageWithMetadata);
    }
  }

  // Room management methods for game sessions
  joinRoom(roomId: string): void {
    if (!this.isConnected()) {
      throw new Error('Socket is not connected');
    }
    this.socket!.emit('join-room', roomId);
  }

  leaveRoom(roomId: string): void {
    if (!this.isConnected()) {
      return;
    }
    this.socket!.emit('leave-room', roomId);
  }

  // Broadcast to room (for host actions)
  broadcastToRoom(roomId: string, message: SocketMessage): void {
    if (!this.isConnected()) {
      throw new Error('Socket is not connected');
    }
    
    this.socket!.emit('broadcast-to-room', {
      roomId,
      message: {
        ...message,
        timestamp: Date.now(),
        messageId: this.generateMessageId()
      }
    });
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  onMessage(handler: (message: SocketMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  onReconnect(handler: () => void): void {
    this.reconnectHandlers.push(handler);
  }

  onConnection(handler: () => void): void {
    this.connectionHandlers.push(handler);
  }

  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  // Get connection state for debugging
  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  private handleMessage(data: SocketMessage): void {
    try {
      // Handle heartbeat internally
      if (data.type === 'HEARTBEAT') {
        this.socket?.emit('heartbeat-ack');
        return;
      }

      this.notifyMessageHandlers(data);
    } catch (error) {
      this.notifyErrorHandlers(new Error('Failed to parse socket message'));
    }
  }

  private validateMessage(message: SocketMessage): void {
    if (!message.type || typeof message.type !== 'string') {
      throw new Error('Invalid message format: missing or invalid type');
    }
    if (message.payload === undefined) {
      throw new Error('Invalid message format: missing payload');
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const { message, options } = this.messageQueue.shift()!;
      this.send(message, options);
    }
  }

  private notifyMessageHandlers(message: SocketMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    });
  }

  private notifyReconnectHandlers(): void {
    this.reconnectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in reconnect handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }
}