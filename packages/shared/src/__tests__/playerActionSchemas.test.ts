import {
  basePlayerActionSchema,
  moveActionSchema,
  abilityActionSchema,
  readyActionSchema,
  chatActionSchema,
  emoteActionSchema,
  playerActionSchema,
  joinGameSchema,
  leaveGameSchema,
  characterSelectSchema,
  validatePlayerAction,
  validateJoinGame,
  validateLeaveGame,
  validateCharacterSelect,
  safeValidatePlayerAction,
  safeValidateJoinGame,
  safeValidateLeaveGame,
  safeValidateCharacterSelect,
} from '../schemas/playerActionSchemas';

describe('Player Action Schemas', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('basePlayerActionSchema', () => {
    it('should validate valid base action', () => {
      const action = {
        playerId: validUuid,
        timestamp: Date.now(),
      };
      expect(() => basePlayerActionSchema.parse(action)).not.toThrow();
    });

    it('should validate without timestamp', () => {
      const action = {
        playerId: validUuid,
      };
      expect(() => basePlayerActionSchema.parse(action)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const action = {
        playerId: 'not-a-uuid',
      };
      expect(() => basePlayerActionSchema.parse(action)).toThrow();
    });
  });

  describe('moveActionSchema', () => {
    it('should validate all directions', () => {
      ['up', 'down', 'left', 'right'].forEach(direction => {
        const action = {
          playerId: validUuid,
          action: 'MOVE',
          direction,
        };
        expect(() => moveActionSchema.parse(action)).not.toThrow();
      });
    });

    it('should reject invalid direction', () => {
      const action = {
        playerId: validUuid,
        action: 'MOVE',
        direction: 'diagonal',
      };
      expect(() => moveActionSchema.parse(action)).toThrow();
    });

    it('should reject wrong action type', () => {
      const action = {
        playerId: validUuid,
        action: 'JUMP',
        direction: 'up',
      };
      expect(() => moveActionSchema.parse(action)).toThrow();
    });
  });

  describe('abilityActionSchema', () => {
    it('should validate ability with target ID', () => {
      const action = {
        playerId: validUuid,
        action: 'USE_ABILITY',
        abilityId: 'fireball',
        targetId: 'enemy-123',
      };
      expect(() => abilityActionSchema.parse(action)).not.toThrow();
    });

    it('should validate ability with target position', () => {
      const action = {
        playerId: validUuid,
        action: 'USE_ABILITY',
        abilityId: 'meteor',
        targetPosition: { x: 10, y: 15 },
      };
      expect(() => abilityActionSchema.parse(action)).not.toThrow();
    });

    it('should validate ability without target (self-cast)', () => {
      const action = {
        playerId: validUuid,
        action: 'USE_ABILITY',
        abilityId: 'heal-self',
      };
      expect(() => abilityActionSchema.parse(action)).not.toThrow();
    });

    it('should reject empty ability ID', () => {
      const action = {
        playerId: validUuid,
        action: 'USE_ABILITY',
        abilityId: '',
      };
      expect(() => abilityActionSchema.parse(action)).toThrow();
    });

    it('should reject non-integer position', () => {
      const action = {
        playerId: validUuid,
        action: 'USE_ABILITY',
        abilityId: 'test',
        targetPosition: { x: 10.5, y: 15 },
      };
      expect(() => abilityActionSchema.parse(action)).toThrow();
    });
  });

  describe('readyActionSchema', () => {
    it('should validate ready true', () => {
      const action = {
        playerId: validUuid,
        action: 'SET_READY',
        ready: true,
      };
      expect(() => readyActionSchema.parse(action)).not.toThrow();
    });

    it('should validate ready false', () => {
      const action = {
        playerId: validUuid,
        action: 'SET_READY',
        ready: false,
      };
      expect(() => readyActionSchema.parse(action)).not.toThrow();
    });

    it('should reject missing ready field', () => {
      const action = {
        playerId: validUuid,
        action: 'SET_READY',
      };
      expect(() => readyActionSchema.parse(action)).toThrow();
    });
  });

  describe('chatActionSchema', () => {
    it('should validate valid chat message', () => {
      const action = {
        playerId: validUuid,
        action: 'CHAT',
        message: 'Hello team!',
      };
      expect(() => chatActionSchema.parse(action)).not.toThrow();
    });

    it('should validate message at max length', () => {
      const action = {
        playerId: validUuid,
        action: 'CHAT',
        message: 'A'.repeat(200),
      };
      expect(() => chatActionSchema.parse(action)).not.toThrow();
    });

    it('should reject empty message', () => {
      const action = {
        playerId: validUuid,
        action: 'CHAT',
        message: '',
      };
      expect(() => chatActionSchema.parse(action)).toThrow();
    });

    it('should reject message too long', () => {
      const action = {
        playerId: validUuid,
        action: 'CHAT',
        message: 'A'.repeat(201),
      };
      expect(() => chatActionSchema.parse(action)).toThrow();
    });
  });

  describe('emoteActionSchema', () => {
    it('should validate valid emote', () => {
      const action = {
        playerId: validUuid,
        action: 'EMOTE',
        emoteId: 'wave',
      };
      expect(() => emoteActionSchema.parse(action)).not.toThrow();
    });

    it('should reject empty emote ID', () => {
      const action = {
        playerId: validUuid,
        action: 'EMOTE',
        emoteId: '',
      };
      expect(() => emoteActionSchema.parse(action)).toThrow();
    });
  });

  describe('playerActionSchema (union)', () => {
    it('should validate move action', () => {
      const action = {
        playerId: validUuid,
        action: 'MOVE',
        direction: 'up',
      };
      expect(() => playerActionSchema.parse(action)).not.toThrow();
    });

    it('should validate ability action', () => {
      const action = {
        playerId: validUuid,
        action: 'USE_ABILITY',
        abilityId: 'test',
      };
      expect(() => playerActionSchema.parse(action)).not.toThrow();
    });

    it('should validate ready action', () => {
      const action = {
        playerId: validUuid,
        action: 'SET_READY',
        ready: true,
      };
      expect(() => playerActionSchema.parse(action)).not.toThrow();
    });

    it('should validate chat action', () => {
      const action = {
        playerId: validUuid,
        action: 'CHAT',
        message: 'Test',
      };
      expect(() => playerActionSchema.parse(action)).not.toThrow();
    });

    it('should validate emote action', () => {
      const action = {
        playerId: validUuid,
        action: 'EMOTE',
        emoteId: 'laugh',
      };
      expect(() => playerActionSchema.parse(action)).not.toThrow();
    });

    it('should reject unknown action type', () => {
      const action = {
        playerId: validUuid,
        action: 'UNKNOWN_ACTION',
      };
      expect(() => playerActionSchema.parse(action)).toThrow();
    });
  });

  describe('joinGameSchema', () => {
    it('should validate valid join request', () => {
      const request = {
        gameCode: 'ABC123',
        playerName: 'TestPlayer',
      };
      expect(() => joinGameSchema.parse(request)).not.toThrow();
    });

    it('should reject game code too short', () => {
      const request = {
        gameCode: 'ABC',
        playerName: 'TestPlayer',
      };
      expect(() => joinGameSchema.parse(request)).toThrow();
    });

    it('should reject game code too long', () => {
      const request = {
        gameCode: 'ABCDEFG',
        playerName: 'TestPlayer',
      };
      expect(() => joinGameSchema.parse(request)).toThrow();
    });

    it('should reject lowercase in game code', () => {
      const request = {
        gameCode: 'abc123',
        playerName: 'TestPlayer',
      };
      expect(() => joinGameSchema.parse(request)).toThrow();
    });

    it('should reject special characters in game code', () => {
      const request = {
        gameCode: 'ABC!23',
        playerName: 'TestPlayer',
      };
      expect(() => joinGameSchema.parse(request)).toThrow();
    });

    it('should reject empty player name', () => {
      const request = {
        gameCode: 'ABC123',
        playerName: '',
      };
      expect(() => joinGameSchema.parse(request)).toThrow();
    });

    it('should reject player name too long', () => {
      const request = {
        gameCode: 'ABC123',
        playerName: 'A'.repeat(51),
      };
      expect(() => joinGameSchema.parse(request)).toThrow();
    });
  });

  describe('leaveGameSchema', () => {
    it('should validate valid leave request', () => {
      const request = {
        playerId: validUuid,
      };
      expect(() => leaveGameSchema.parse(request)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const request = {
        playerId: 'invalid-id',
      };
      expect(() => leaveGameSchema.parse(request)).toThrow();
    });
  });

  describe('characterSelectSchema', () => {
    it('should validate all character classes', () => {
      ['warrior', 'ranger', 'mage', 'cleric'].forEach(characterClass => {
        const request = {
          playerId: validUuid,
          characterClass,
        };
        expect(() => characterSelectSchema.parse(request)).not.toThrow();
      });
    });

    it('should reject invalid character class', () => {
      const request = {
        playerId: validUuid,
        characterClass: 'paladin',
      };
      expect(() => characterSelectSchema.parse(request)).toThrow();
    });
  });

  describe('Validation functions', () => {
    it('should validate with validatePlayerAction', () => {
      const action = {
        playerId: validUuid,
        action: 'MOVE',
        direction: 'up',
      };
      expect(validatePlayerAction(action)).toEqual(action);
    });

    it('should throw with validatePlayerAction on invalid', () => {
      expect(() => validatePlayerAction({ invalid: 'data' })).toThrow();
    });

    it('should return success with safeValidatePlayerAction', () => {
      const action = {
        playerId: validUuid,
        action: 'MOVE',
        direction: 'up',
      };
      const result = safeValidatePlayerAction(action);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(action);
      }
    });

    it('should return error with safeValidatePlayerAction', () => {
      const result = safeValidatePlayerAction({ invalid: 'data' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should work with all validation functions', () => {
      // Test existence
      expect(typeof validateJoinGame).toBe('function');
      expect(typeof validateLeaveGame).toBe('function');
      expect(typeof validateCharacterSelect).toBe('function');
      expect(typeof safeValidateJoinGame).toBe('function');
      expect(typeof safeValidateLeaveGame).toBe('function');
      expect(typeof safeValidateCharacterSelect).toBe('function');

      // Test they work
      const joinRequest = { gameCode: 'ABC123', playerName: 'Test' };
      expect(validateJoinGame(joinRequest)).toEqual(joinRequest);

      const leaveRequest = { playerId: validUuid };
      expect(validateLeaveGame(leaveRequest)).toEqual(leaveRequest);

      const characterRequest = { playerId: validUuid, characterClass: 'warrior' };
      expect(validateCharacterSelect(characterRequest)).toEqual(characterRequest);
    });
  });
});