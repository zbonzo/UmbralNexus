import {
  baseMessageSchema,
  createGameMessageSchema,
  joinGameMessageSchema,
  leaveGameMessageSchema,
  playerActionMessageSchema,
  playerReadyMessageSchema,
  heartbeatMessageSchema,
  gameCreatedMessageSchema,
  gameStateUpdateMessageSchema,
  playerJoinedMessageSchema,
  playerLeftMessageSchema,
  errorMessageSchema,
  clientMessageSchema,
  serverMessageSchema,
  socketOptionsSchema,
  validateClientMessage,
  validateServerMessage,
  validateSocketOptions,
  safeValidateClientMessage,
  safeValidateServerMessage,
  safeValidateSocketOptions,
} from '../schemas/websocketSchemas';

describe('WebSocket Schemas', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('baseMessageSchema', () => {
    it('should validate basic message structure', () => {
      const message = {
        type: 'TEST_MESSAGE',
        payload: { data: 'test' },
        timestamp: Date.now(),
        messageId: 'msg-123',
      };
      expect(() => baseMessageSchema.parse(message)).not.toThrow();
    });

    it('should accept minimal message', () => {
      const message = {
        type: 'TEST',
        payload: null,
      };
      expect(() => baseMessageSchema.parse(message)).not.toThrow();
    });

    it('should reject empty type', () => {
      const message = {
        type: '',
        payload: {},
      };
      expect(() => baseMessageSchema.parse(message)).toThrow();
    });
  });

  describe('Client message schemas', () => {
    describe('createGameMessageSchema', () => {
      it('should validate create game message', () => {
        const message = {
          type: 'CREATE_GAME',
          payload: {
            hostName: 'TestHost',
            playerCap: 4,
            difficulty: 'normal',
          },
        };
        expect(() => createGameMessageSchema.parse(message)).not.toThrow();
      });

      it('should reject invalid difficulty', () => {
        const message = {
          type: 'CREATE_GAME',
          payload: {
            hostName: 'TestHost',
            playerCap: 4,
            difficulty: 'impossible',
          },
        };
        expect(() => createGameMessageSchema.parse(message)).toThrow();
      });

      it('should reject player cap out of range', () => {
        const message = {
          type: 'CREATE_GAME',
          payload: {
            hostName: 'TestHost',
            playerCap: 25,
            difficulty: 'normal',
          },
        };
        expect(() => createGameMessageSchema.parse(message)).toThrow();
      });
    });

    describe('joinGameMessageSchema', () => {
      it('should validate join game message', () => {
        const message = {
          type: 'JOIN_GAME',
          payload: {
            gameCode: 'ABC123',
            playerName: 'TestPlayer',
          },
        };
        expect(() => joinGameMessageSchema.parse(message)).not.toThrow();
      });

      it('should reject invalid game code length', () => {
        const message = {
          type: 'JOIN_GAME',
          payload: {
            gameCode: 'ABC',
            playerName: 'TestPlayer',
          },
        };
        expect(() => joinGameMessageSchema.parse(message)).toThrow();
      });
    });

    describe('playerActionMessageSchema', () => {
      it('should validate move action', () => {
        const message = {
          type: 'PLAYER_ACTION',
          payload: {
            action: 'MOVE',
            direction: 'up',
          },
        };
        expect(() => playerActionMessageSchema.parse(message)).not.toThrow();
      });

      it('should validate ability action', () => {
        const message = {
          type: 'PLAYER_ACTION',
          payload: {
            action: 'USE_ABILITY',
            abilityId: 'fireball',
            targetPosition: { x: 10, y: 15 },
          },
        };
        expect(() => playerActionMessageSchema.parse(message)).not.toThrow();
      });

      it('should validate chat action', () => {
        const message = {
          type: 'PLAYER_ACTION',
          payload: {
            action: 'CHAT',
            message: 'Hello team!',
          },
        };
        expect(() => playerActionMessageSchema.parse(message)).not.toThrow();
      });

      it('should reject chat message too long', () => {
        const message = {
          type: 'PLAYER_ACTION',
          payload: {
            action: 'CHAT',
            message: 'A'.repeat(201),
          },
        };
        expect(() => playerActionMessageSchema.parse(message)).toThrow();
      });

      it('should reject invalid action', () => {
        const message = {
          type: 'PLAYER_ACTION',
          payload: {
            action: 'INVALID_ACTION',
          },
        };
        expect(() => playerActionMessageSchema.parse(message)).toThrow();
      });
    });

    describe('heartbeatMessageSchema', () => {
      it('should validate heartbeat message', () => {
        const message = {
          type: 'HEARTBEAT',
          payload: {},
        };
        expect(() => heartbeatMessageSchema.parse(message)).not.toThrow();
      });
    });
  });

  describe('Server message schemas', () => {
    describe('gameCreatedMessageSchema', () => {
      it('should validate game created message', () => {
        const message = {
          type: 'GAME_CREATED',
          payload: {
            gameId: 'ABC123',
            hostId: validUuid,
          },
        };
        expect(() => gameCreatedMessageSchema.parse(message)).not.toThrow();
      });

      it('should reject invalid UUID', () => {
        const message = {
          type: 'GAME_CREATED',
          payload: {
            gameId: 'ABC123',
            hostId: 'invalid-uuid',
          },
        };
        expect(() => gameCreatedMessageSchema.parse(message)).toThrow();
      });
    });

    describe('gameStateUpdateMessageSchema', () => {
      it('should validate game state update', () => {
        const message = {
          type: 'GAME_STATE_UPDATE',
          payload: {
            gameId: 'ABC123',
            players: [],
            currentPhase: 'lobby',
            currentFloor: 1,
          },
        };
        expect(() => gameStateUpdateMessageSchema.parse(message)).not.toThrow();
      });

      it('should validate with start time', () => {
        const message = {
          type: 'GAME_STATE_UPDATE',
          payload: {
            gameId: 'ABC123',
            players: [],
            currentPhase: 'active',
            currentFloor: 2,
            startTime: Date.now(),
          },
        };
        expect(() => gameStateUpdateMessageSchema.parse(message)).not.toThrow();
      });

      it('should reject invalid phase', () => {
        const message = {
          type: 'GAME_STATE_UPDATE',
          payload: {
            gameId: 'ABC123',
            players: [],
            currentPhase: 'invalid',
            currentFloor: 1,
          },
        };
        expect(() => gameStateUpdateMessageSchema.parse(message)).toThrow();
      });
    });

    describe('errorMessageSchema', () => {
      it('should validate error message', () => {
        const message = {
          type: 'ERROR',
          payload: {
            code: 'GAME_NOT_FOUND',
            message: 'Game not found',
          },
        };
        expect(() => errorMessageSchema.parse(message)).not.toThrow();
      });

      it('should validate error with details', () => {
        const message = {
          type: 'ERROR',
          payload: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: { field: 'name' },
          },
        };
        expect(() => errorMessageSchema.parse(message)).not.toThrow();
      });
    });
  });

  describe('Union schemas', () => {
    describe('clientMessageSchema', () => {
      it('should validate all client message types', () => {
        const messages = [
          {
            type: 'CREATE_GAME',
            payload: { hostName: 'Test', playerCap: 4, difficulty: 'normal' },
          },
          {
            type: 'JOIN_GAME',
            payload: { gameCode: 'ABC123', playerName: 'Test' },
          },
          {
            type: 'LEAVE_GAME',
            payload: {},
          },
          {
            type: 'PLAYER_ACTION',
            payload: { action: 'MOVE', direction: 'up' },
          },
          {
            type: 'PLAYER_READY',
            payload: { ready: true },
          },
          {
            type: 'HEARTBEAT',
            payload: {},
          },
        ];

        messages.forEach(message => {
          expect(() => clientMessageSchema.parse(message)).not.toThrow();
        });
      });

      it('should reject unknown client message type', () => {
        const message = {
          type: 'UNKNOWN_TYPE',
          payload: {},
        };
        expect(() => clientMessageSchema.parse(message)).toThrow();
      });
    });

    describe('serverMessageSchema', () => {
      it('should validate all server message types', () => {
        const messages = [
          {
            type: 'GAME_CREATED',
            payload: { gameId: 'ABC123', hostId: validUuid },
          },
          {
            type: 'GAME_STATE_UPDATE',
            payload: {
              gameId: 'ABC123',
              players: [],
              currentPhase: 'lobby',
              currentFloor: 1,
            },
          },
          {
            type: 'PLAYER_JOINED',
            payload: { playerId: validUuid },
          },
          {
            type: 'PLAYER_LEFT',
            payload: { playerId: validUuid },
          },
          {
            type: 'ERROR',
            payload: { code: 'ERROR', message: 'Test error' },
          },
          {
            type: 'HEARTBEAT',
            payload: {},
          },
        ];

        messages.forEach(message => {
          expect(() => serverMessageSchema.parse(message)).not.toThrow();
        });
      });
    });
  });

  describe('socketOptionsSchema', () => {
    it('should validate socket options', () => {
      const options = {
        queue: true,
        timeout: 5000,
        acknowledgment: false,
      };
      expect(() => socketOptionsSchema.parse(options)).not.toThrow();
    });

    it('should validate empty options', () => {
      const options = {};
      expect(() => socketOptionsSchema.parse(options)).not.toThrow();
    });

    it('should reject timeout too low', () => {
      const options = {
        timeout: 500,
      };
      expect(() => socketOptionsSchema.parse(options)).toThrow();
    });

    it('should reject timeout too high', () => {
      const options = {
        timeout: 35000,
      };
      expect(() => socketOptionsSchema.parse(options)).toThrow();
    });
  });

  describe('Validation functions', () => {
    it('should validate with validateClientMessage', () => {
      const message = {
        type: 'HEARTBEAT',
        payload: {},
      };
      expect(validateClientMessage(message)).toEqual(message);
    });

    it('should throw with validateClientMessage on invalid', () => {
      expect(() => validateClientMessage({ invalid: 'data' })).toThrow();
    });

    it('should return success with safeValidateClientMessage', () => {
      const message = {
        type: 'HEARTBEAT',
        payload: {},
      };
      const result = safeValidateClientMessage(message);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should return error with safeValidateClientMessage', () => {
      const result = safeValidateClientMessage({ invalid: 'data' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should work with all validation functions', () => {
      expect(typeof validateServerMessage).toBe('function');
      expect(typeof validateSocketOptions).toBe('function');
      expect(typeof safeValidateServerMessage).toBe('function');
      expect(typeof safeValidateSocketOptions).toBe('function');

      // Test they work
      const serverMessage = {
        type: 'ERROR',
        payload: { code: 'TEST', message: 'Test' },
      };
      expect(validateServerMessage(serverMessage)).toEqual(serverMessage);

      const options = { timeout: 5000 };
      expect(validateSocketOptions(options)).toEqual(options);
    });
  });
});