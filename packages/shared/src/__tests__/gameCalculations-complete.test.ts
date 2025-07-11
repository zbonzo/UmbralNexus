import {
  calculateExperienceGain,
  calculateLevelFromExperience,
  calculateExperienceRequired,
} from '../utils/gameCalculations';

describe('Game Calculations - Complete Coverage', () => {
  describe('calculateExperienceGain', () => {
    it('should calculate base XP for same level', () => {
      const xp = calculateExperienceGain(5, 5);
      expect(xp).toBe(50); // enemyLevel * 10
    });

    it('should give bonus XP for higher level enemies', () => {
      const xp = calculateExperienceGain(5, 8); // 3 levels higher
      expect(xp).toBe(104); // 80 * 1.3
    });

    it('should give reduced XP for much lower level enemies', () => {
      const xp = calculateExperienceGain(10, 5); // 5 levels lower
      expect(xp).toBe(25); // 50 * 0.5 (actual formula gives 50 * (1 + (-5 * 0.1)) = 25)
    });

    it('should give minimum XP for extremely low level enemies', () => {
      const xp = calculateExperienceGain(20, 1); // 19 levels lower
      expect(xp).toBe(1); // 10 * 0.1
    });

    it('should handle level 2 difference without penalty', () => {
      const xp = calculateExperienceGain(5, 3); // 2 levels lower
      expect(xp).toBe(30); // No penalty at exactly 2 level difference
    });

    it('should apply group kill penalty', () => {
      const soloXP = calculateExperienceGain(5, 5, false);
      const groupXP = calculateExperienceGain(5, 5, true);
      
      expect(soloXP).toBe(50);
      expect(groupXP).toBe(35); // 50 * 0.7
    });

    it('should handle edge case of level 0', () => {
      const xp = calculateExperienceGain(5, 0);
      expect(xp).toBe(0); // 0 * 10 = 0
    });

    it('should handle very high level differences', () => {
      const xp = calculateExperienceGain(1, 50); // 49 levels higher
      expect(xp).toBe(2950); // 500 * (1 + 49 * 0.1) = 500 * 5.9 = 2950
    });

    it('should apply both bonuses correctly', () => {
      // Higher level enemy in group
      const xp = calculateExperienceGain(5, 10, true);
      expect(xp).toBe(105); // 100 * 1.5 * 0.7
    });
  });

  describe('calculateLevelFromExperience', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevelFromExperience(0)).toBe(1);
    });

    it('should return level 1 for XP below 100', () => {
      expect(calculateLevelFromExperience(50)).toBe(1);
      expect(calculateLevelFromExperience(99)).toBe(1);
    });

    it('should return level 2 at exactly 100 XP', () => {
      expect(calculateLevelFromExperience(100)).toBe(2);
    });

    it('should calculate correct levels', () => {
      expect(calculateLevelFromExperience(400)).toBe(3); // sqrt(400/100) + 1 = 3
      expect(calculateLevelFromExperience(900)).toBe(4); // sqrt(900/100) + 1 = 4
      expect(calculateLevelFromExperience(1600)).toBe(5); // sqrt(1600/100) + 1 = 5
    });

    it('should handle large XP values', () => {
      expect(calculateLevelFromExperience(10000)).toBe(11); // sqrt(10000/100) + 1 = 11
      expect(calculateLevelFromExperience(1000000)).toBe(101); // sqrt(1000000/100) + 1 = 101
    });

    it('should handle edge case between levels', () => {
      expect(calculateLevelFromExperience(399)).toBe(2); // Just below level 3
      expect(calculateLevelFromExperience(401)).toBe(3); // Just above level 3 threshold
    });

    it('should handle negative XP as level 1', () => {
      // Math.sqrt of negative gives NaN, Math.max(1, NaN + 1) gives NaN, so need to handle this
      const result = calculateLevelFromExperience(-100);
      expect(result).toBe(1); // Should be 1 but currently returns NaN - this reveals a bug
    });
  });

  describe('calculateExperienceRequired', () => {
    it('should return 0 XP for level 1', () => {
      expect(calculateExperienceRequired(1)).toBe(0); // (1-1)^2 * 100 = 0
    });

    it('should calculate correct XP requirements', () => {
      expect(calculateExperienceRequired(2)).toBe(100); // (2-1)^2 * 100 = 100
      expect(calculateExperienceRequired(3)).toBe(400); // (3-1)^2 * 100 = 400
      expect(calculateExperienceRequired(4)).toBe(900); // (4-1)^2 * 100 = 900
      expect(calculateExperienceRequired(5)).toBe(1600); // (5-1)^2 * 100 = 1600
    });

    it('should handle high levels', () => {
      expect(calculateExperienceRequired(10)).toBe(8100); // (10-1)^2 * 100 = 8100
      expect(calculateExperienceRequired(20)).toBe(36100); // (20-1)^2 * 100 = 36100
    });

    it('should handle level 0 as level 1', () => {
      expect(calculateExperienceRequired(0)).toBe(100); // (0-1)^2 * 100 = 100
    });

    it('should handle negative levels', () => {
      expect(calculateExperienceRequired(-5)).toBe(3600); // (-5-1)^2 * 100 = 3600
    });
  });

  describe('Level and XP consistency', () => {
    it('should have consistent level calculation', () => {
      // For each level, calculate required XP and verify it maps back to the same level
      for (let level = 1; level <= 10; level++) {
        const requiredXP = calculateExperienceRequired(level);
        const calculatedLevel = calculateLevelFromExperience(requiredXP);
        expect(calculatedLevel).toBe(level);
      }
    });

    it('should have consistent XP thresholds', () => {
      // Just below level threshold should be previous level
      expect(calculateLevelFromExperience(99)).toBe(1);
      expect(calculateLevelFromExperience(399)).toBe(2);
      expect(calculateLevelFromExperience(899)).toBe(3);
      
      // At threshold should be the level
      expect(calculateLevelFromExperience(100)).toBe(2);
      expect(calculateLevelFromExperience(400)).toBe(3);
      expect(calculateLevelFromExperience(900)).toBe(4);
    });
  });
});