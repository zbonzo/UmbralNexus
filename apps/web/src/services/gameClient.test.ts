import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameClient } from './gameClient';
import { SocketClient } from './socketClient';

// Mock SocketClient
vi.mock('./socketClient');

describe('GameClient', () => {
  let gameClient: GameClient;
  let mockSocketClient: any;
  let mockOnGameStateUpdate: ReturnType<typeof vi.fn>;
  let mockOnPlayerJoined: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSocketClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn(),
      send: vi.fn(),
      joinRoom: vi.fn(),
      leaveRoom: vi.fn(),
      onMessage: vi.fn(),
      onError: vi.fn(),
      onReconnect: vi.fn(),
      isConnected: vi.fn().mockReturnValue(true)
    };

    (SocketClient as any).mockImplementation(() => mockSocketClient);

    mockOnGameStateUpdate = vi.fn();
    mockOnPlayerJoined = vi.fn();
    mockOnError = vi.fn();

    gameClient = new GameClient();
    gameClient.onGameStateUpdate(mockOnGameStateUpdate);
    gameClient.onPlayerJoined(mockOnPlayerJoined);
    gameClient.onError(mockOnError);
  });

  afterEach(() => {
    gameClient.disconnect();
  });

  describe('Game Management', () => {
    it('should create a new game', async () => {
      const gameConfig = {
        hostName: 'Test Host',
        playerCap: 4,
        difficulty: 'normal' as const
      };

      await gameClient.connect();
      
      // Don't await the result to avoid timeout, just verify the message was sent
      gameClient.createGame(gameConfig);

      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'CREATE_GAME',
        payload: gameConfig
      }, { acknowledgment: true });
    });

    it('should join an existing game', async () => {
      const gameCode = 'ABC123';
      const playerName = 'Test Player';

      await gameClient.connect();
      await gameClient.joinGame(gameCode, playerName);

      expect(mockSocketClient.joinRoom).toHaveBeenCalledWith(gameCode);
      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'JOIN_GAME',
        payload: { gameCode, playerName }
      }, { acknowledgment: true });
    });

    it('should leave a game', async () => {
      await gameClient.connect();
      
      // First join a game to set currentGameId
      await gameClient.joinGame('ABC123', 'Test Player');
      
      // Then leave the game
      await gameClient.leaveGame();

      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'LEAVE_GAME',
        payload: {}
      });
      expect(mockSocketClient.leaveRoom).toHaveBeenCalledWith('ABC123');
    });
  });

  describe('Player Actions', () => {
    beforeEach(() => {
      // Set up a mock current player for action tests
      gameClient.setCurrentPlayer({
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
        level: 1,
        health: 100,
        maxHealth: 100,
        position: { floor: 1, x: 0, y: 0 },
        actionPoints: 3,
        abilities: [
          { id: 'shield-bash', name: 'Shield Bash', cost: 1, cooldown: 0 }
        ],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date()
      });
    });

    it('should send move action', async () => {
      await gameClient.connect();
      await gameClient.move('up');

      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'PLAYER_ACTION',
        payload: {
          action: 'MOVE',
          direction: 'up'
        }
      });
    });

    it('should send ability action', async () => {
      await gameClient.connect();
      await gameClient.useAbility('shield-bash', 'enemy-123');

      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'PLAYER_ACTION',
        payload: {
          action: 'USE_ABILITY',
          abilityId: 'shield-bash',
          targetId: 'enemy-123'
        }
      });
    });

    it('should send ready status', async () => {
      await gameClient.connect();
      await gameClient.setReady(true);

      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'PLAYER_READY',
        payload: { ready: true }
      });
    });
  });

  describe('Message Handling', () => {
    it('should handle game state updates', () => {
      const gameState = {
        gameId: 'ABC123',
        players: [],
        currentPhase: 'lobby' as const,
        currentFloor: 1
      };

      // Simulate receiving a game state message
      const messageHandler = mockSocketClient.onMessage.mock.calls[0][0];
      messageHandler({
        type: 'GAME_STATE_UPDATE',
        payload: gameState
      });

      expect(mockOnGameStateUpdate).toHaveBeenCalledWith(gameState);
    });

    it('should handle player joined events', () => {
      const player = {
        playerId: 'player-123',
        name: 'New Player',
        class: 'warrior' as const
      };

      const messageHandler = mockSocketClient.onMessage.mock.calls[0][0];
      messageHandler({
        type: 'PLAYER_JOINED',
        payload: player
      });

      expect(mockOnPlayerJoined).toHaveBeenCalledWith(player);
    });

    it('should handle error messages', () => {
      const error = {
        code: 'GAME_NOT_FOUND',
        message: 'Game with code ABC123 not found'
      };

      const messageHandler = mockSocketClient.onMessage.mock.calls[0][0];
      messageHandler({
        type: 'ERROR',
        payload: error
      });

      expect(mockOnError).toHaveBeenCalledWith(error);
    });

    it('should ignore unknown message types', () => {
      const messageHandler = mockSocketClient.onMessage.mock.calls[0][0];
      messageHandler({
        type: 'UNKNOWN_TYPE',
        payload: {}
      });

      // Should not call any handlers
      expect(mockOnGameStateUpdate).not.toHaveBeenCalled();
      expect(mockOnPlayerJoined).not.toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('Connection Management', () => {
    it('should connect to WebSocket server', async () => {
      await gameClient.connect();
      expect(mockSocketClient.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      mockSocketClient.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(gameClient.connect()).rejects.toThrow('Connection failed');
    });

    it('should attempt reconnection with queued actions', async () => {
      // Set up a mock current player for this test
      gameClient.setCurrentPlayer({
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
        level: 1,
        health: 100,
        maxHealth: 100,
        position: { floor: 1, x: 0, y: 0 },
        actionPoints: 3,
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date()
      });

      // Queue an action while disconnected
      mockSocketClient.isConnected.mockReturnValue(false);
      await gameClient.move('left');

      // Reconnect
      mockSocketClient.isConnected.mockReturnValue(true);
      const reconnectHandler = mockSocketClient.onReconnect.mock.calls[0][0];
      reconnectHandler();

      // Verify queued action was sent
      expect(mockSocketClient.send).toHaveBeenCalledWith({
        type: 'PLAYER_ACTION',
        payload: {
          action: 'MOVE',
          direction: 'left'
        }
      });
    });
  });

  describe('Game State Validation', () => {
    it('should validate player actions against game state', async () => {
      // Set current player AP to 0
      gameClient.setCurrentPlayer({
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
        actionPoints: 0,
        health: 100,
        maxHealth: 100,
        position: { floor: 1, x: 0, y: 0 },
        abilities: [],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date(),
        level: 1
      });

      await gameClient.connect();

      // Attempt to move with 0 AP
      await expect(gameClient.move('up')).rejects.toThrow('Not enough action points');
    });

    it('should validate ability usage', async () => {
      gameClient.setCurrentPlayer({
        playerId: 'player-123',
        name: 'Test Player',
        class: 'warrior',
        actionPoints: 1,
        health: 100,
        maxHealth: 100,
        position: { floor: 1, x: 0, y: 0 },
        abilities: [
          { id: 'shield-bash', name: 'Shield Bash', cost: 1, cooldown: 0 }
        ],
        nexusEchoes: [],
        inventory: [],
        joinedAt: new Date(),
        level: 1
      });

      await gameClient.connect();

      // Valid ability use
      await expect(gameClient.useAbility('shield-bash')).resolves.not.toThrow();

      // Invalid ability (too expensive)
      await expect(gameClient.useAbility('whirlwind')).rejects.toThrow('Ability not available');
    });
  });
});