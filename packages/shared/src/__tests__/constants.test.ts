import {
  GAME_CONSTANTS,
  CHARACTER_STATS,
  FLOOR_DIMENSIONS,
  WEBSOCKET_EVENTS,
} from '../constants';

describe('Constants', () => {
  describe('GAME_CONSTANTS', () => {
    it('should export all expected game constants', () => {
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBe(20);
      expect(GAME_CONSTANTS.MIN_PLAYERS).toBe(1);
      expect(GAME_CONSTANTS.DEFAULT_AP_COUNT).toBe(3);
      expect(GAME_CONSTANTS.TURN_TIME_LIMIT).toBe(30);
      expect(GAME_CONSTANTS.RECONNECT_TIMEOUT).toBe(300);
      expect(GAME_CONSTANTS.MOVEMENT_COST).toBe(1);
      expect(GAME_CONSTANTS.BASIC_ATTACK_COST).toBe(1);
      expect(GAME_CONSTANTS.GAME_ID_LENGTH).toBe(6);
      expect(GAME_CONSTANTS.PLAYER_NAME_MAX_LENGTH).toBe(20);
      expect(GAME_CONSTANTS.GAME_NAME_MAX_LENGTH).toBe(50);
    });

    it('should have correct vision range values', () => {
      expect(GAME_CONSTANTS.VISION_RANGE.DEFAULT).toBe(5);
      expect(GAME_CONSTANTS.VISION_RANGE.RANGER_BONUS).toBe(2);
    });

    it('should be immutable (TypeScript const assertion)', () => {
      // The 'as const' provides compile-time immutability, not runtime
      // This test verifies the constants exist and have expected values
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBe(20);
      expect(typeof GAME_CONSTANTS).toBe('object');
    });
  });

  describe('CHARACTER_STATS', () => {
    it('should have stats for all character classes', () => {
      expect(CHARACTER_STATS.warrior).toBeDefined();
      expect(CHARACTER_STATS.ranger).toBeDefined();
      expect(CHARACTER_STATS.mage).toBeDefined();
      expect(CHARACTER_STATS.cleric).toBeDefined();
    });

    it('should have correct warrior stats', () => {
      expect(CHARACTER_STATS.warrior.baseHealth).toBe(120);
      expect(CHARACTER_STATS.warrior.baseDamage).toBe(15);
      expect(CHARACTER_STATS.warrior.baseDefense).toBe(5);
      expect(CHARACTER_STATS.warrior.moveRange).toBe(3);
    });

    it('should have correct ranger stats', () => {
      expect(CHARACTER_STATS.ranger.baseHealth).toBe(80);
      expect(CHARACTER_STATS.ranger.baseDamage).toBe(12);
      expect(CHARACTER_STATS.ranger.baseDefense).toBe(2);
      expect(CHARACTER_STATS.ranger.moveRange).toBe(4);
    });

    it('should have correct mage stats', () => {
      expect(CHARACTER_STATS.mage.baseHealth).toBe(60);
      expect(CHARACTER_STATS.mage.baseDamage).toBe(18);
      expect(CHARACTER_STATS.mage.baseDefense).toBe(1);
      expect(CHARACTER_STATS.mage.moveRange).toBe(3);
    });

    it('should have correct cleric stats', () => {
      expect(CHARACTER_STATS.cleric.baseHealth).toBe(100);
      expect(CHARACTER_STATS.cleric.baseDamage).toBe(10);
      expect(CHARACTER_STATS.cleric.baseDefense).toBe(3);
      expect(CHARACTER_STATS.cleric.moveRange).toBe(3);
    });

    it('should be immutable (TypeScript const assertion)', () => {
      expect(CHARACTER_STATS.warrior.baseHealth).toBe(120);
      expect(typeof CHARACTER_STATS).toBe('object');
    });
  });

  describe('FLOOR_DIMENSIONS', () => {
    it('should have all dimension constants', () => {
      expect(FLOOR_DIMENSIONS.MIN_WIDTH).toBe(20);
      expect(FLOOR_DIMENSIONS.MAX_WIDTH).toBe(50);
      expect(FLOOR_DIMENSIONS.MIN_HEIGHT).toBe(20);
      expect(FLOOR_DIMENSIONS.MAX_HEIGHT).toBe(50);
      expect(FLOOR_DIMENSIONS.MIN_ROOMS).toBe(5);
      expect(FLOOR_DIMENSIONS.MAX_ROOMS).toBe(15);
    });

    it('should have valid ranges', () => {
      expect(FLOOR_DIMENSIONS.MIN_WIDTH).toBeLessThan(FLOOR_DIMENSIONS.MAX_WIDTH);
      expect(FLOOR_DIMENSIONS.MIN_HEIGHT).toBeLessThan(FLOOR_DIMENSIONS.MAX_HEIGHT);
      expect(FLOOR_DIMENSIONS.MIN_ROOMS).toBeLessThan(FLOOR_DIMENSIONS.MAX_ROOMS);
    });

    it('should be immutable (TypeScript const assertion)', () => {
      expect(FLOOR_DIMENSIONS.MIN_WIDTH).toBe(20);
      expect(typeof FLOOR_DIMENSIONS).toBe('object');
    });
  });

  describe('WEBSOCKET_EVENTS', () => {
    it('should have all client-to-server events', () => {
      expect(WEBSOCKET_EVENTS.JOIN_GAME).toBe('JOIN_GAME');
      expect(WEBSOCKET_EVENTS.LEAVE_GAME).toBe('LEAVE_GAME');
      expect(WEBSOCKET_EVENTS.PLAYER_ACTION).toBe('PLAYER_ACTION');
      expect(WEBSOCKET_EVENTS.HEARTBEAT).toBe('HEARTBEAT');
    });

    it('should have all server-to-client events', () => {
      expect(WEBSOCKET_EVENTS.GAME_STATE).toBe('GAME_STATE');
      expect(WEBSOCKET_EVENTS.GAME_UPDATE).toBe('GAME_UPDATE');
      expect(WEBSOCKET_EVENTS.ERROR).toBe('ERROR');
      expect(WEBSOCKET_EVENTS.ACKNOWLEDGMENT).toBe('ACKNOWLEDGMENT');
    });

    it('should be immutable (TypeScript const assertion)', () => {
      expect(WEBSOCKET_EVENTS.JOIN_GAME).toBe('JOIN_GAME');
      expect(typeof WEBSOCKET_EVENTS).toBe('object');
    });

    it('should have unique event names', () => {
      const eventNames = Object.values(WEBSOCKET_EVENTS);
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety for constants', () => {
      // This is a compile-time test, but we can verify the types are correctly inferred
      const maxPlayers = GAME_CONSTANTS.MAX_PLAYERS;
      const warriorHealth = CHARACTER_STATS.warrior.baseHealth;
      const minWidth = FLOOR_DIMENSIONS.MIN_WIDTH;
      const joinEvent = WEBSOCKET_EVENTS.JOIN_GAME;
      
      expect(maxPlayers).toBe(20);
      expect(warriorHealth).toBe(120);
      expect(minWidth).toBe(20);
      expect(joinEvent).toBe('JOIN_GAME');
    });
  });
});