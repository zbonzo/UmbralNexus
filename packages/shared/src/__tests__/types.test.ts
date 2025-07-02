import type { CharacterClass, GamePhase, Player } from '../types';

describe('Shared Types', () => {
  it('should allow correct character classes', () => {
    const validClasses: CharacterClass[] = ['warrior', 'ranger', 'mage', 'cleric'];
    expect(validClasses).toHaveLength(4);
  });

  it('should allow correct game phases', () => {
    const validPhases: GamePhase[] = ['lobby', 'active', 'victory', 'defeat'];
    expect(validPhases).toHaveLength(4);
  });

  it('should have correct Player interface structure', () => {
    const mockPlayer: Player = {
      playerId: 'test-id',
      name: 'Test Player',
      class: 'warrior',
      level: 1,
      health: 100,
      maxHealth: 100,
      position: { floor: 1, x: 0, y: 0 },
      joinedAt: new Date(),
      abilities: [],
      nexusEchoes: [],
      inventory: [],
      actionPoints: 3,
    };
    
    expect(mockPlayer.class).toBe('warrior');
    expect(mockPlayer.actionPoints).toBe(3);
  });
});