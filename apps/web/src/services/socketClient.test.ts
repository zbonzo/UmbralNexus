import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SocketClient } from './socketClient';

// Create a mock socket that we can control
const createMockSocket = () => ({
  connected: false,
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn()
});

// Mock Socket.IO
vi.mock('socket.io-client', () => ({
  io: vi.fn()
}));

describe('SocketClient', () => {
  let client: SocketClient;
  let mockSocket: ReturnType<typeof createMockSocket>;
  let mockMessageHandler: ReturnType<typeof vi.fn>;
  let mockErrorHandler: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Create a fresh mock socket for each test
    mockSocket = createMockSocket();
    
    // Set up the io mock to return our mock socket
    const { io } = await import('socket.io-client');
    (io as any).mockReturnValue(mockSocket);

    mockMessageHandler = vi.fn();
    mockErrorHandler = vi.fn();
    client = new SocketClient('http://localhost:8887');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a socket connection', () => {
    expect(client).toBeDefined();
    expect(client.isConnected()).toBe(false);
  });

  it('should connect and set connected state', async () => {
    client.onMessage(mockMessageHandler);
    client.onError(mockErrorHandler);
    
    // Start the connection process
    const connectPromise = client.connect();
    
    // Simulate successful connection
    mockSocket.connected = true;
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectHandler?.();
    
    await connectPromise;
    
    expect(client.isConnected()).toBe(true);
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it('should handle connection errors', async () => {
    const connectPromise = client.connect();
    
    // Simulate connection error
    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')?.[1];
    const error = new Error('Connection failed');
    errorHandler?.(error);
    
    await expect(connectPromise).rejects.toThrow();
  });

  it('should send messages when connected', async () => {
    // Set up connection
    const connectPromise = client.connect();
    mockSocket.connected = true;
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectHandler?.();
    await connectPromise;
    
    const message = { type: 'TEST_MESSAGE', payload: { test: true } };
    
    expect(() => client.send(message)).not.toThrow();
    expect(mockSocket.emit).toHaveBeenCalledWith('game-message', expect.objectContaining({
      type: 'TEST_MESSAGE',
      payload: { test: true },
      timestamp: expect.any(Number),
      messageId: expect.any(String)
    }));
  });

  it('should throw error when sending while disconnected', () => {
    const message = { type: 'TEST_MESSAGE', payload: { test: true } };
    
    expect(() => client.send(message)).toThrow('Socket is not connected');
  });

  it('should handle room operations', async () => {
    // Set up connection
    const connectPromise = client.connect();
    mockSocket.connected = true;
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectHandler?.();
    await connectPromise;
    
    // Test joining room
    client.joinRoom('test-room');
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'test-room');
    
    // Test leaving room  
    client.leaveRoom('test-room');
    expect(mockSocket.emit).toHaveBeenCalledWith('leave-room', 'test-room');
  });

  it('should queue messages when disconnected and send on reconnect', async () => {
    const message1 = { type: 'QUEUED_1', payload: { data: 1 } };
    const message2 = { type: 'QUEUED_2', payload: { data: 2 } };
    
    // Queue messages while disconnected
    client.send(message1, { queue: true });
    client.send(message2, { queue: true });
    
    expect(client.getQueuedMessageCount()).toBe(2);
    
    // Connect and verify messages are sent
    const connectPromise = client.connect();
    mockSocket.connected = true;
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectHandler?.();
    await connectPromise;
    
    expect(client.getQueuedMessageCount()).toBe(0);
    expect(mockSocket.emit).toHaveBeenCalledWith('game-message', expect.objectContaining({
      type: 'QUEUED_1',
      payload: { data: 1 }
    }));
  });

  it('should validate message format', async () => {
    // Set up connection
    const connectPromise = client.connect();
    mockSocket.connected = true;
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectHandler?.();
    await connectPromise;
    
    // Invalid message without type
    expect(() => client.send({ payload: {} } as any)).toThrow('Invalid message format');
    
    // Invalid message without payload
    expect(() => client.send({ type: 'TEST' } as any)).toThrow('Invalid message format');
  });
});