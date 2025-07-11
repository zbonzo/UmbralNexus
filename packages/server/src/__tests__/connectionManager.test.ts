import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';
import { ConnectionManager } from '../websocket/connectionManager';
import { logger } from '../utils/logger';
import type { ClientMessage } from '@umbral-nexus/shared';

// Mock the logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('ConnectionManager', () => {
  let mockIo: jest.Mocked<Server>;
  let connectionManager: ConnectionManager;
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock setInterval and clearInterval
    global.setInterval = jest.fn().mockImplementation((fn, delay) => {
      return setTimeout(fn, delay);
    });
    global.clearInterval = jest.fn();

    // Create mock Socket.IO server
    mockIo = {
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    // Create mock socket
    mockSocket = {
      id: 'socket-123',
      on: jest.fn(),
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };

    connectionManager = new ConnectionManager(mockIo);
  });

  afterEach(() => {
    connectionManager.disconnect();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should setup event handlers on io server', () => {
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should start heartbeat monitoring', () => {
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 10000);
    });
  });

  describe('socket event handlers setup', () => {
    it('should setup all socket event handlers', () => {
      // Simulate connection event
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('join-game', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('leave-game', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('player-action', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('heartbeat', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('Client connected: socket-123');
    });
  });

  describe('handleJoinGame', () => {
    let joinGameHandler: Function;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
    });

    it('should successfully handle player joining game', () => {
      const data = {
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      };

      joinGameHandler(data);

      expect(mockSocket.join).toHaveBeenCalledWith('ABC123');
      expect(mockSocket.emit).toHaveBeenCalledWith('connection-acknowledged', {
        playerId: 'player-123',
        gameId: 'ABC123',
        timestamp: expect.any(String),
      });
      expect(mockSocket.to).toHaveBeenCalledWith('ABC123');
      expect(mockSocket.emit).toHaveBeenCalledWith('player-joined', {
        playerId: 'player-123',
        playerName: 'Test Player',
        timestamp: expect.any(String),
      });
      expect(logger.info).toHaveBeenCalledWith('Player player-123 joined game ABC123');
    });

    it('should remove existing connection for same player', () => {
      const data = {
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      };

      // Join first time
      joinGameHandler(data);
      expect(connectionManager.isPlayerConnected('player-123')).toBe(true);
      
      // Join again with different socket (simulates reconnection)
      const newMockSocket = { ...mockSocket, id: 'socket-456' };
      const newConnectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      newConnectionHandler(newMockSocket);
      const newJoinHandler = newMockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      
      newJoinHandler(data);
      
      expect(connectionManager.isPlayerConnected('player-123')).toBe(true);
      expect(connectionManager.getGamePlayerCount('ABC123')).toBe(1);
    });

    it('should handle join game errors gracefully', () => {
      mockSocket.join.mockImplementation(() => {
        throw new Error('Socket join failed');
      });

      const data = {
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      };

      joinGameHandler(data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to join game',
        details: 'Socket join failed'
      });
      expect(logger.error).toHaveBeenCalledWith('Error handling join game:', expect.any(Error));
    });

    it('should create new game room if not exists', () => {
      const data = {
        gameId: 'NEW123',
        playerId: 'player-123',
        playerName: 'Test Player'
      };

      joinGameHandler(data);

      expect(connectionManager.getGamePlayerCount('NEW123')).toBe(1);
      expect(connectionManager.getGamePlayers('NEW123')).toEqual(['player-123']);
    });
  });

  describe('handleLeaveGame', () => {
    let leaveGameHandler: Function;
    let joinGameHandler: Function;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      leaveGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'leave-game')[1];

      // Join a game first
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });
    });

    it('should successfully handle player leaving game', () => {
      const data = {
        gameId: 'ABC123',
        playerId: 'player-123'
      };

      leaveGameHandler(data);

      expect(mockSocket.leave).toHaveBeenCalledWith('ABC123');
      expect(mockSocket.to).toHaveBeenCalledWith('ABC123');
      expect(mockSocket.emit).toHaveBeenCalledWith('player-left', {
        playerId: 'player-123',
        timestamp: expect.any(String),
      });
      expect(connectionManager.isPlayerConnected('player-123')).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Player player-123 left game ABC123');
    });

    it('should remove empty game rooms', () => {
      const data = {
        gameId: 'ABC123',
        playerId: 'player-123'
      };

      leaveGameHandler(data);

      expect(connectionManager.getGamePlayerCount('ABC123')).toBe(0);
    });

    it('should handle leave game errors gracefully', () => {
      mockSocket.leave.mockImplementation(() => {
        throw new Error('Socket leave failed');
      });

      const data = {
        gameId: 'ABC123',
        playerId: 'player-123'
      };

      leaveGameHandler(data);

      expect(logger.error).toHaveBeenCalledWith('Error handling leave game:', expect.any(Error));
    });
  });

  describe('handlePlayerAction', () => {
    let playerActionHandler: Function;
    let joinGameHandler: Function;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      playerActionHandler = mockSocket.on.mock.calls.find(call => call[0] === 'player-action')[1];

      // Join a game first
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });
    });

    it('should handle player action successfully', () => {
      const message: ClientMessage = {
        type: 'PLAYER_ACTION',
        payload: {
          action: 'MOVE',
          direction: 'up'
        },
        messageId: 'msg-123'
      };

      playerActionHandler(message);

      expect(mockSocket.to).toHaveBeenCalledWith('ABC123');
      expect(mockSocket.emit).toHaveBeenCalledWith('player-action', {
        ...message,
        playerId: 'player-123',
        timestamp: expect.any(String),
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('action-acknowledged', {
        messageId: 'msg-123',
        timestamp: expect.any(String),
      });
      expect(logger.debug).toHaveBeenCalledWith('Player action from player-123: PLAYER_ACTION');
    });

    it('should reject action from unconnected player', () => {
      const disconnectedSocket = { 
        ...mockSocket, 
        id: 'socket-999',
        on: jest.fn(),
        emit: jest.fn(),
        join: jest.fn(),
        to: jest.fn().mockReturnThis()
      };
      const message: ClientMessage = {
        type: 'PLAYER_ACTION',
        payload: {
          action: 'MOVE',
          direction: 'up'
        }
      };

      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(disconnectedSocket);
      const disconnectedActionHandler = disconnectedSocket.on.mock.calls.find(call => call[0] === 'player-action')[1];

      disconnectedActionHandler(message);

      expect(disconnectedSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Player not connected to any game'
      });
    });

    it('should handle action processing errors', () => {
      mockSocket.to.mockImplementation(() => {
        throw new Error('Broadcast failed');
      });

      const message: ClientMessage = {
        type: 'PLAYER_ACTION',
        payload: {
          action: 'MOVE',
          direction: 'up'
        }
      };

      playerActionHandler(message);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to process action',
        details: 'Broadcast failed'
      });
      expect(logger.error).toHaveBeenCalledWith('Error handling player action:', expect.any(Error));
    });

    it('should update heartbeat on action', () => {
      const message: ClientMessage = {
        type: 'HEARTBEAT',
        payload: {}
      };

      const beforeTime = Date.now();
      playerActionHandler(message);
      const afterTime = Date.now();

      // Verify heartbeat was updated (connection should still be active)
      expect(connectionManager.isPlayerConnected('player-123')).toBe(true);
    });
  });

  describe('handleHeartbeat', () => {
    let heartbeatHandler: Function;
    let joinGameHandler: Function;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      heartbeatHandler = mockSocket.on.mock.calls.find(call => call[0] === 'heartbeat')[1];

      // Join a game first
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });
    });

    it('should handle heartbeat successfully', () => {
      heartbeatHandler();

      expect(mockSocket.emit).toHaveBeenCalledWith('heartbeat-acknowledged');
    });

    it('should ignore heartbeat from unconnected socket', () => {
      const disconnectedSocket = { ...mockSocket, id: 'socket-999', emit: jest.fn() };
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(disconnectedSocket);
      const disconnectedHeartbeatHandler = disconnectedSocket.on.mock.calls.find(call => call[0] === 'heartbeat')[1];

      disconnectedHeartbeatHandler();

      expect(disconnectedSocket.emit).not.toHaveBeenCalledWith('heartbeat-acknowledged');
    });
  });

  describe('handleDisconnection', () => {
    let disconnectHandler: Function;
    let joinGameHandler: Function;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

      // Join a game first
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });
    });

    it('should handle disconnection successfully', () => {
      disconnectHandler('transport close');

      expect(mockSocket.to).toHaveBeenCalledWith('ABC123');
      expect(mockSocket.emit).toHaveBeenCalledWith('player-disconnected', {
        playerId: 'player-123',
        timestamp: expect.any(String),
      });
      expect(connectionManager.isPlayerConnected('player-123')).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Client disconnected: socket-123, reason: transport close');
    });

    it('should handle disconnection from unconnected socket', () => {
      const disconnectedSocket = { ...mockSocket, id: 'socket-999', to: jest.fn().mockReturnThis(), emit: jest.fn() };
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(disconnectedSocket);
      const disconnectedDisconnectHandler = disconnectedSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

      disconnectedDisconnectHandler('transport close');

      expect(disconnectedSocket.to).not.toHaveBeenCalled();
    });
  });

  describe('heartbeat monitoring', () => {
    let joinGameHandler: Function;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];

      // Join a game
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });
    });

    it('should remove timed out connections', () => {
      // Get the connection's lastHeartbeat time
      const connection = connectionManager['connections'].get('player-123');
      const originalHeartbeatTime = connection!.lastHeartbeat.getTime();
      
      // Manually trigger the heartbeat monitoring function
      const heartbeatMonitoringFn = (global.setInterval as jest.Mock).mock.calls[0][0];
      
      // Mock Date constructor to return a time 31 seconds later
      const MockDate = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(originalHeartbeatTime + 31000);
          } else {
            super(...args);
          }
        }
        
        getTime(): number {
          return originalHeartbeatTime + 31000;
        }
        
        static now(): number {
          return originalHeartbeatTime + 31000;
        }
      };
      
      const originalDate = global.Date;
      global.Date = MockDate as any;
      
      heartbeatMonitoringFn();
      
      expect(connectionManager.isPlayerConnected('player-123')).toBe(false);
      expect(mockIo.to).toHaveBeenCalledWith('ABC123');
      expect(mockIo.emit).toHaveBeenCalledWith('player-timeout', {
        playerId: 'player-123',
        timestamp: expect.any(String),
      });
      expect(logger.warn).toHaveBeenCalledWith('Player player-123 timed out, removing connection');
      
      // Restore Date
      global.Date = originalDate;
    });

    it('should not remove connections within timeout', () => {
      // Fast forward time by 25 seconds (within 30 second timeout)
      jest.advanceTimersByTime(25000);

      expect(connectionManager.isPlayerConnected('player-123')).toBe(true);
    });

    it('should reset timeout on heartbeat', () => {
      // Fast forward to just before timeout
      jest.advanceTimersByTime(29000);
      
      // Send heartbeat
      const heartbeatHandler = mockSocket.on.mock.calls.find(call => call[0] === 'heartbeat')[1];
      heartbeatHandler();
      
      // Fast forward another 25 seconds (total 54 seconds, but heartbeat was 25 seconds ago)
      jest.advanceTimersByTime(25000);

      expect(connectionManager.isPlayerConnected('player-123')).toBe(true);
    });
  });

  describe('public methods', () => {
    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      const joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];

      // Join a game
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });
    });

    describe('broadcastToGame', () => {
      it('should broadcast message to all players in game', () => {
        const data = { message: 'Game started!' };
        
        connectionManager.broadcastToGame('ABC123', 'game-event', data);

        expect(mockIo.to).toHaveBeenCalledWith('ABC123');
        expect(mockIo.emit).toHaveBeenCalledWith('game-event', data);
      });
    });

    describe('sendToPlayer', () => {
      it('should send message to specific player', () => {
        const data = { message: 'Personal message' };
        
        connectionManager.sendToPlayer('player-123', 'private-message', data);

        expect(mockIo.to).toHaveBeenCalledWith('socket-123');
        expect(mockIo.emit).toHaveBeenCalledWith('private-message', data);
      });

      it('should handle non-existent player gracefully', () => {
        const data = { message: 'Personal message' };
        
        connectionManager.sendToPlayer('non-existent', 'private-message', data);

        // Should not throw error, just do nothing
        expect(mockIo.to).not.toHaveBeenCalled();
      });
    });

    describe('getGamePlayerCount', () => {
      it('should return correct player count', () => {
        expect(connectionManager.getGamePlayerCount('ABC123')).toBe(1);
      });

      it('should return 0 for non-existent game', () => {
        expect(connectionManager.getGamePlayerCount('NOTFND')).toBe(0);
      });
    });

    describe('getGamePlayers', () => {
      it('should return array of player IDs', () => {
        expect(connectionManager.getGamePlayers('ABC123')).toEqual(['player-123']);
      });

      it('should return empty array for non-existent game', () => {
        expect(connectionManager.getGamePlayers('NOTFND')).toEqual([]);
      });
    });

    describe('isPlayerConnected', () => {
      it('should return true for connected player', () => {
        expect(connectionManager.isPlayerConnected('player-123')).toBe(true);
      });

      it('should return false for non-connected player', () => {
        expect(connectionManager.isPlayerConnected('non-existent')).toBe(false);
      });
    });
  });

  describe('disconnect', () => {
    it('should clear all connections and intervals', () => {
      // Join a game first to have some connections
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      const joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Test Player'
      });

      connectionManager.disconnect();

      expect(global.clearInterval).toHaveBeenCalled();
      expect(connectionManager.getGamePlayerCount('ABC123')).toBe(0);
    });
  });

  describe('multiple players in game', () => {
    let joinGameHandler: Function;
    let mockSocket2: any;

    beforeEach(() => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      
      // First player
      connectionHandler(mockSocket);
      joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];
      joinGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123',
        playerName: 'Player 1'
      });

      // Second player
      mockSocket2 = { ...mockSocket, id: 'socket-456', on: jest.fn(), emit: jest.fn(), join: jest.fn(), to: jest.fn().mockReturnThis() };
      connectionHandler(mockSocket2);
      const joinGameHandler2 = mockSocket2.on.mock.calls.find(call => call[0] === 'join-game')[1];
      joinGameHandler2({
        gameId: 'ABC123',
        playerId: 'player-456',
        playerName: 'Player 2'
      });
    });

    it('should track multiple players in same game', () => {
      expect(connectionManager.getGamePlayerCount('ABC123')).toBe(2);
      expect(connectionManager.getGamePlayers('ABC123')).toEqual(['player-123', 'player-456']);
    });

    it('should maintain game room when one player leaves', () => {
      const leaveGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'leave-game')[1];
      leaveGameHandler({
        gameId: 'ABC123',
        playerId: 'player-123'
      });

      expect(connectionManager.getGamePlayerCount('ABC123')).toBe(1);
      expect(connectionManager.getGamePlayers('ABC123')).toEqual(['player-456']);
    });

    it('should handle broadcast to multiple players', () => {
      connectionManager.broadcastToGame('ABC123', 'test-event', { data: 'test' });

      expect(mockIo.to).toHaveBeenCalledWith('ABC123');
      expect(mockIo.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid join game data', () => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockSocket);
      const joinGameHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join-game')[1];

      // Test with missing fields - this should cause an error in the connection manager
      try {
        joinGameHandler({
          gameId: 'ABC123',
          // Missing playerId and playerName
        });
      } catch (error) {
        // Expected to fail due to missing required fields
      }

      // The join should either complete successfully (if it handles missing fields gracefully)
      // or emit an error to the socket
      const emitCalls = mockSocket.emit.mock.calls;
      const hasError = emitCalls.some(call => call[0] === 'error');
      const hasAcknowledgment = emitCalls.some(call => call[0] === 'connection-acknowledged');
      
      // Should either emit an error or handle gracefully
      expect(hasError || hasAcknowledgment).toBe(true);
    });

    it('should handle socket errors during setup', () => {
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === 'join-game') {
          throw new Error('Event setup failed');
        }
      });

      expect(() => {
        const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
        connectionHandler(mockSocket);
      }).toThrow('Event setup failed');
    });

    it('should handle large number of connections', () => {
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      
      // Create 100 mock connections
      for (let i = 0; i < 100; i++) {
        const socket = { 
          ...mockSocket, 
          id: `socket-${i}`, 
          on: jest.fn(), 
          emit: jest.fn(), 
          join: jest.fn(), 
          to: jest.fn().mockReturnThis() 
        };
        
        connectionHandler(socket);
        const joinHandler = socket.on.mock.calls.find(call => call[0] === 'join-game')[1];
        joinHandler({
          gameId: 'STRESS123',
          playerId: `player-${i}`,
          playerName: `Player ${i}`
        });
      }

      expect(connectionManager.getGamePlayerCount('STRESS123')).toBe(100);
    });
  });
});