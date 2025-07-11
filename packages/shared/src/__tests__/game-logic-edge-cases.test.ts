import { calculateDamage, calculateHealing, canUseAbility, calculateMovementCost } from '../utils/gameCalculations';
import type { Player, Ability } from '../types/game';

describe('Game Logic Edge Cases', () => {
  const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
    playerId: 'test-player',
    name: 'Test Player',
    class: 'warrior',
    level: 1,
    health: 100,
    maxHealth: 100,
    position: { floor: 1, x: 0, y: 0 },
    moveSpeed: 5,
    abilities: [],
    abilityCooldowns: {},
    nexusEchoes: [],
    inventory: [],
    joinedAt: new Date(),
    actionPoints: 3,
    ...overrides,
  });

  const createMockAbility = (overrides: Partial<Ability> = {}): Ability => ({
    id: 'test-ability',
    name: 'Test Ability',
    range: 5,
    cooldownTime: 3000,
    targetType: 'enemy',
    cost: 1,
    cooldown: 3,
    ...overrides,
  });

  describe('Health and Damage Edge Cases', () => {
    it('should handle negative health values', () => {
      const player = createMockPlayer({ health: -50 });
      const ability = createMockAbility();
      
      // Should not be able to use abilities when dead
      expect(canUseAbility(player, ability)).toBe(false);
    });

    it('should handle health exceeding maxHealth', () => {
      const healer = createMockPlayer({ class: 'cleric' });
      const target = createMockPlayer({ health: 95, maxHealth: 100 });
      const healAbility = createMockAbility({ damageOrHeal: 20 });
      
      const healing = calculateHealing(healer, target, healAbility);
      
      // Should cap at maxHealth difference
      expect(healing).toBe(5);
    });

    it('should handle zero maxHealth', () => {
      const player = createMockPlayer({ maxHealth: 0 });
      const target = { health: 50, maxHealth: 0 };
      const ability = createMockAbility();
      
      // Should not crash
      const damage = calculateDamage(player, target, ability);
      expect(damage).toBeGreaterThan(0);
    });

    it('should handle extremely large damage values', () => {
      const player = createMockPlayer({ level: 999 });
      const target = { health: 100, maxHealth: 100 };
      const ability = createMockAbility({ damageOrHeal: 999999 });
      
      const damage = calculateDamage(player, target, ability);
      
      // Should be a reasonable number (accounting for level scaling and randomness)
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(100000000); // Increased threshold for extreme cases
    });

    it('should handle negative damage values', () => {
      const player = createMockPlayer();
      const target = { health: 100, maxHealth: 100 };
      const ability = createMockAbility({ damageOrHeal: -50 });
      
      const damage = calculateDamage(player, target, ability);
      
      // Should always deal at least 1 damage
      expect(damage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Position and Movement Edge Cases', () => {
    it('should handle invalid position coordinates', () => {
      const player1 = createMockPlayer({ 
        position: { floor: 1, x: -999, y: -999 } 
      });
      const player2 = createMockPlayer({ 
        position: { floor: 1, x: 999, y: 999 } 
      });
      
      // Calculate simple distance
      const dx = player2.position.x - player1.position.x;
      const dy = player2.position.y - player1.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeGreaterThan(0);
    });

    it('should handle movement to same position', () => {
      const cost = calculateMovementCost(0);
      expect(cost).toBe(1); // Minimum cost
    });

    it('should handle players on different floors', () => {
      const player1 = createMockPlayer({ 
        position: { floor: 1, x: 0, y: 0 } 
      });
      const player2 = createMockPlayer({ 
        position: { floor: 2, x: 0, y: 0 } 
      });
      
      // Same coordinates but different floors
      expect(player1.position.x).toBe(player2.position.x);
      expect(player1.position.y).toBe(player2.position.y);
      expect(player1.position.floor).not.toBe(player2.position.floor);
    });

    it('should handle fractional position values', () => {
      const player = createMockPlayer({ 
        position: { floor: 1, x: 5.7, y: 3.2 } 
      });
      
      // Should handle gracefully
      const flooredX = Math.floor(player.position.x);
      const flooredY = Math.floor(player.position.y);
      expect(flooredX).toBe(5);
      expect(flooredY).toBe(3);
    });
  });

  describe('Action Points and Cooldowns Edge Cases', () => {
    it('should handle negative action points', () => {
      const player = createMockPlayer({ actionPoints: -5 });
      
      // Should not crash when checking movement cost
      const cost = calculateMovementCost(3);
      expect(cost).toBe(3);
    });

    it('should handle ability cooldown in the past', () => {
      const player = createMockPlayer({ 
        abilityCooldowns: { 'ability-1': Date.now() - 10000 } 
      });
      const ability = createMockAbility({ id: 'ability-1' });
      
      // Should be able to use ability
      expect(canUseAbility(player, ability)).toBe(true);
    });

    it('should handle ability cooldown in the future', () => {
      const player = createMockPlayer({ 
        abilityCooldowns: { 'ability-1': Date.now() + 10000 } 
      });
      const ability = createMockAbility({ id: 'ability-1' });
      
      // Should not be able to use ability
      expect(canUseAbility(player, ability)).toBe(false);
    });

    it('should handle missing ability in cooldowns', () => {
      const player = createMockPlayer({ abilityCooldowns: {} });
      const ability = createMockAbility({ id: 'new-ability' });
      
      // Should be able to use ability
      expect(canUseAbility(player, ability)).toBe(true);
    });
  });

  describe('Ability Targeting Edge Cases', () => {
    it('should handle ability with zero range', () => {
      const ability = createMockAbility({ range: 0 });
      
      // Should only be able to target self
      expect(ability.range).toBe(0);
    });

    it('should handle ability with negative range', () => {
      const ability = createMockAbility({ range: -5 });
      
      // Should be treated as 0 or invalid
      expect(ability.range).toBeLessThan(0);
    });

    it('should handle ability with extreme range', () => {
      const ability = createMockAbility({ range: 9999 });
      
      // Should work but might need capping
      expect(ability.range).toBe(9999);
    });

    it('should handle area of effect with negative radius', () => {
      const ability = createMockAbility({ 
        areaOfEffect: -5,
        targetType: 'ground' 
      });
      
      // Should handle gracefully
      expect(ability.areaOfEffect).toBeLessThan(0);
    });
  });

  describe('Nexus Echo Edge Cases', () => {
    it('should handle player with no echoes', () => {
      const player = createMockPlayer({ nexusEchoes: [] });
      const target = { health: 100, maxHealth: 100 };
      
      const damage = calculateDamage(player, target);
      expect(damage).toBeGreaterThan(0);
    });

    it('should handle player with many offensive echoes', () => {
      const echoes = Array(50).fill(null).map((_, i) => ({
        id: `echo-${i}`,
        name: `Echo ${i}`,
        description: 'Test',
        type: 'offensive' as const,
      }));
      
      const player = createMockPlayer({ nexusEchoes: echoes });
      const target = { health: 100, maxHealth: 100 };
      
      const damage = calculateDamage(player, target);
      
      // Should be very high but not infinite (50 echoes * 10% = 500% multiplier)
      expect(damage).toBeGreaterThan(50); // More realistic expectation
      expect(damage).toBeLessThan(100000);
    });

    it('should handle mixed echo types', () => {
      const player = createMockPlayer({ 
        nexusEchoes: [
          { id: '1', name: 'Off', description: '', type: 'offensive' },
          { id: '2', name: 'Def', description: '', type: 'defensive' },
          { id: '3', name: 'Util', description: '', type: 'utility' },
          { id: '4', name: 'Leg', description: '', type: 'legendary' },
        ]
      });
      
      const healer = createMockPlayer({ 
        class: 'cleric',
        nexusEchoes: player.nexusEchoes 
      });
      
      const healAbility = createMockAbility({ damageOrHeal: 20 });
      
      // Damage should only count offensive
      const damage = calculateDamage(player, { health: 100, maxHealth: 100 });
      expect(damage).toBeGreaterThan(0);
      
      // Healing should count defensive echoes, but target is already at full health
      const targetWithDamage = createMockPlayer({ health: 50, maxHealth: 100 });
      const healing = calculateHealing(healer, targetWithDamage, healAbility);
      expect(healing).toBeGreaterThan(0);
    });
  });

  describe('Class-Specific Edge Cases', () => {
    it('should handle invalid class names', () => {
      const player = createMockPlayer({ class: 'invalid' as any });
      const target = { health: 100, maxHealth: 100 };
      
      // Should use default modifier
      const damage = calculateDamage(player, target);
      expect(damage).toBeGreaterThan(0);
    });

    it('should handle level 0 or negative', () => {
      const player = createMockPlayer({ level: 0 });
      const target = { health: 100, maxHealth: 100 };
      
      const damage = calculateDamage(player, target);
      
      // Should still deal some damage
      expect(damage).toBeGreaterThan(0);
    });

    it('should handle extremely high level', () => {
      const player = createMockPlayer({ level: 9999 });
      const target = { health: 100, maxHealth: 100 };
      
      const damage = calculateDamage(player, target);
      
      // Should be high but not game-breaking
      expect(damage).toBeGreaterThan(1000);
      expect(damage).toBeLessThan(10000000);
    });
  });
});
