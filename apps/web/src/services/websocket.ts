import type { WebSocketMessage, WebSocketOptions } from '@umbral-nexus/shared';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];
  private reconnectHandlers: (() => void)[] = [];

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          this.ws = null;
          this.attemptReconnect();
        };

        this.ws.onerror = () => {
          this.notifyErrorHandlers(new Error('WebSocket connection error'));
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage, options: WebSocketOptions = {}): void {
    this.validateMessage(message);

    if (!this.isConnected() && options.queue) {
      this.messageQueue.push(message);
      return;
    }

    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    const messageWithMetadata = {
      ...message,
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };

    this.ws!.send(JSON.stringify(messageWithMetadata));
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  onReconnect(handler: () => void): void {
    this.reconnectHandlers.push(handler);
  }

  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat internally
      if (message.type === 'HEARTBEAT') {
        this.send({ type: 'HEARTBEAT_ACK', payload: {} });
        return;
      }

      this.notifyMessageHandlers(message);
    } catch (error) {
      this.notifyErrorHandlers(new Error('Failed to parse WebSocket message'));
    }
  }

  private validateMessage(message: WebSocketMessage): void {
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
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyErrorHandlers(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(async () => {
      try {
        await this.connect();
        this.notifyReconnectHandlers();
      } catch (error) {
        // Will attempt reconnect again due to onclose handler
      }
    }, delay);
  }

  private notifyMessageHandlers(message: WebSocketMessage): void {
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
}