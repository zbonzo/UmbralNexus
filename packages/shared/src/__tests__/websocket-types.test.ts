import {
  ClientMessageType,
  ServerMessageType,
  type SocketMessage,
  type SocketOptions,
  type WebSocketMessage,
  type WebSocketOptions,
  type ClientMessage,
  type ServerMessage,
  type PlayerPositionUpdate,
} from '../types/websocket';

describe('WebSocket Types', () => {
  describe('ClientMessageType enum', () => {
    it('should have all expected client message types', () => {
      expect(ClientMessageType.CREATE_GAME).toBe('CREATE_GAME');
      expect(ClientMessageType.JOIN_GAME).toBe('JOIN_GAME');
      expect(ClientMessageType.LEAVE_GAME).toBe('LEAVE_GAME');
      expect(ClientMessageType.PLAYER_ACTION).toBe('PLAYER_ACTION');
      expect(ClientMessageType.PLAYER_READY).toBe('PLAYER_READY');
      expect(ClientMessageType.HEARTBEAT).toBe('HEARTBEAT');
    });

    it('should have unique values', () => {
      const values = Object.values(ClientMessageType);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('ServerMessageType enum', () => {
    it('should have all expected server message types', () => {
      expect(ServerMessageType.GAME_CREATED).toBe('GAME_CREATED');
      expect(ServerMessageType.GAME_STATE_UPDATE).toBe('GAME_STATE_UPDATE');
      expect(ServerMessageType.PLAYER_JOINED).toBe('PLAYER_JOINED');
      expect(ServerMessageType.PLAYER_LEFT).toBe('PLAYER_LEFT');
      expect(ServerMessageType.PLAYER_UPDATE).toBe('PLAYER_UPDATE');
      expect(ServerMessageType.PLAYER_POSITION_UPDATE).toBe('PLAYER_POSITION_UPDATE');
      expect(ServerMessageType.ERROR).toBe('ERROR');
      expect(ServerMessageType.HEARTBEAT).toBe('HEARTBEAT');
    });

    it('should have unique values', () => {
      const values = Object.values(ServerMessageType);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Type interfaces', () => {
    it('should properly type SocketMessage', () => {
      const message: SocketMessage = {
        type: 'TEST_MESSAGE',
        payload: { data: 'test' },
        timestamp: Date.now(),
        messageId: 'msg-123',
      };

      expect(message.type).toBe('TEST_MESSAGE');
      expect(message.payload).toEqual({ data: 'test' });
    });

    it('should allow optional fields in SocketMessage', () => {
      const message: SocketMessage = {
        type: 'TEST',
        payload: null,
      };

      expect(message.timestamp).toBeUndefined();
      expect(message.messageId).toBeUndefined();
    });

    it('should properly type SocketOptions', () => {
      const options: SocketOptions = {
        queue: true,
        timeout: 5000,
        acknowledgment: false,
      };

      expect(options.queue).toBe(true);
      expect(options.timeout).toBe(5000);
      expect(options.acknowledgment).toBe(false);
    });

    it('should allow empty SocketOptions', () => {
      const options: SocketOptions = {};
      expect(options.queue).toBeUndefined();
      expect(options.timeout).toBeUndefined();
      expect(options.acknowledgment).toBeUndefined();
    });

    it('should properly type WebSocketMessage', () => {
      const message: WebSocketMessage = {
        type: 'WS_MESSAGE',
        payload: [1, 2, 3],
        timestamp: 12345,
        messageId: 'ws-msg-1',
      };

      expect(message.type).toBe('WS_MESSAGE');
      expect(message.payload).toEqual([1, 2, 3]);
    });

    it('should properly type WebSocketOptions', () => {
      const options: WebSocketOptions = {
        queue: false,
        timeout: 10000,
      };

      expect(options.queue).toBe(false);
      expect(options.timeout).toBe(10000);
    });

    it('should properly type ClientMessage', () => {
      const message: ClientMessage = {
        type: ClientMessageType.JOIN_GAME,
        payload: { gameId: 'ABC123' },
        timestamp: Date.now(),
        messageId: 'client-msg-1',
      };

      expect(message.type).toBe('JOIN_GAME');
      expect(message.payload).toEqual({ gameId: 'ABC123' });
      expect(message.timestamp).toBeGreaterThan(0);
      expect(message.messageId).toBe('client-msg-1');
    });

    it('should properly type ServerMessage', () => {
      const message: ServerMessage = {
        type: ServerMessageType.GAME_STATE_UPDATE,
        payload: { state: 'active' },
        timestamp: Date.now(),
        messageId: 'server-msg-1',
      };

      expect(message.type).toBe('GAME_STATE_UPDATE');
      expect(message.payload).toEqual({ state: 'active' });
    });

    it('should allow optional messageId in ServerMessage', () => {
      const message: ServerMessage = {
        type: ServerMessageType.ERROR,
        payload: { error: 'Test error' },
        timestamp: Date.now(),
      };

      expect(message.messageId).toBeUndefined();
    });

    it('should properly type PlayerPositionUpdate', () => {
      const update: PlayerPositionUpdate = {
        playerId: 'player-123',
        position: {
          floor: 2,
          x: 10,
          y: 15,
        },
        actionPoints: 3,
      };

      expect(update.playerId).toBe('player-123');
      expect(update.position.floor).toBe(2);
      expect(update.position.x).toBe(10);
      expect(update.position.y).toBe(15);
      expect(update.actionPoints).toBe(3);
    });

    it('should allow optional actionPoints in PlayerPositionUpdate', () => {
      const update: PlayerPositionUpdate = {
        playerId: 'player-456',
        position: {
          floor: 1,
          x: 5,
          y: 5,
        },
      };

      expect(update.actionPoints).toBeUndefined();
    });
  });

  describe('Type safety', () => {
    it('should enforce ClientMessageType values', () => {
      const validMessage: ClientMessage = {
        type: ClientMessageType.PLAYER_ACTION,
        payload: { action: 'move' },
        timestamp: Date.now(),
        messageId: 'test',
      };

      // This should compile
      expect(validMessage.type).toBe('PLAYER_ACTION');

      // TypeScript would prevent this at compile time:
      // const invalidMessage: ClientMessage = {
      //   type: 'INVALID_TYPE', // Error: Type '"INVALID_TYPE"' is not assignable
      //   payload: {},
      //   timestamp: Date.now(),
      //   messageId: 'test',
      // };
    });

    it('should enforce required fields', () => {
      // Valid message has all required fields
      const validMessage: ClientMessage = {
        type: ClientMessageType.HEARTBEAT,
        timestamp: Date.now(),
        messageId: 'heartbeat-1',
      };

      expect(validMessage.type).toBeDefined();
      expect(validMessage.timestamp).toBeDefined();
      expect(validMessage.messageId).toBeDefined();

      // TypeScript would prevent missing required fields:
      // const invalidMessage: ClientMessage = {
      //   type: ClientMessageType.HEARTBEAT,
      //   // Missing timestamp and messageId - TypeScript error
      // };
    });
  });
});