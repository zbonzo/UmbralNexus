import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from './websocket';

// Mock WebSocket
class MockWebSocket {
  public url: string;
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Echo back for testing
    setTimeout(() => {
      this.onmessage?.(new MessageEvent('message', { data }));
    }, 10);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close'));
  }
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any;

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  let mockMessageHandler: ReturnType<typeof vi.fn>;
  let mockErrorHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMessageHandler = vi.fn();
    mockErrorHandler = vi.fn();
    client = new WebSocketClient('ws://localhost:8887');
  });

  afterEach(() => {
    client.disconnect();
  });

  it('should create a WebSocket connection', () => {
    expect(client).toBeDefined();
    expect(client.isConnected()).toBe(false); // Initially not connected
  });

  it('should connect and set connected state', async () => {
    client.onMessage(mockMessageHandler);
    client.onError(mockErrorHandler);
    
    await client.connect();
    
    expect(client.isConnected()).toBe(true);
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it('should send messages when connected', async () => {
    await client.connect();
    
    const message = { type: 'TEST_MESSAGE', payload: { test: true } };
    
    expect(() => client.send(message)).not.toThrow();
  });

  it('should throw error when sending while disconnected', () => {
    const message = { type: 'TEST_MESSAGE', payload: { test: true } };
    
    expect(() => client.send(message)).toThrow('WebSocket is not connected');
  });

  it('should handle incoming messages', async () => {
    client.onMessage(mockMessageHandler);
    await client.connect();
    
    // Send a message to trigger echo
    const testMessage = { type: 'ECHO_TEST', payload: { data: 'test' } };
    client.send(testMessage);
    
    // Wait for message to be echoed back
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // The handler should receive the message with metadata added
    expect(mockMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ECHO_TEST',
        payload: { data: 'test' },
        timestamp: expect.any(Number),
        messageId: expect.any(String)
      })
    );
  });

  it('should handle disconnection', async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
    
    client.disconnect();
    expect(client.isConnected()).toBe(false);
  });

  it('should attempt reconnection on connection loss', async () => {
    const mockReconnectHandler = vi.fn();
    client.onReconnect(mockReconnectHandler);
    
    await client.connect();
    
    // Simulate connection loss
    const ws = (client as any).ws;
    ws.readyState = WebSocket.CLOSED;
    ws.onclose?.(new CloseEvent('close'));
    
    // Wait for reconnection attempt (with longer timeout for backoff)
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(mockReconnectHandler).toHaveBeenCalled();
  });

  it('should validate message format before sending', async () => {
    await client.connect();
    
    // Invalid message without type
    expect(() => client.send({ payload: {} } as any)).toThrow('Invalid message format');
    
    // Invalid message without payload
    expect(() => client.send({ type: 'TEST' } as any)).toThrow('Invalid message format');
  });

  it('should handle heartbeat messages', async () => {
    client.onMessage(mockMessageHandler);
    await client.connect();
    
    // Simulate receiving a heartbeat
    const heartbeat = { type: 'HEARTBEAT', payload: {} };
    (client as any).handleMessage({ data: JSON.stringify(heartbeat) });
    
    // Heartbeat should not be passed to message handler
    expect(mockMessageHandler).not.toHaveBeenCalledWith(heartbeat);
  });

  it('should queue messages when disconnected and send on reconnect', async () => {
    const message1 = { type: 'QUEUED_1', payload: { data: 1 } };
    const message2 = { type: 'QUEUED_2', payload: { data: 2 } };
    
    // Queue messages while disconnected
    client.send(message1, { queue: true });
    client.send(message2, { queue: true });
    
    expect(client.getQueuedMessageCount()).toBe(2);
    
    // Connect and verify messages are sent
    await client.connect();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(client.getQueuedMessageCount()).toBe(0);
  });
});