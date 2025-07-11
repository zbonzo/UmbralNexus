import {
  randomInt,
  randomFloat,
  createSeededRandom,
  randomChoice,
  randomChoices,
  shuffle,
  randomBoolean,
  weightedRandomChoice,
  generateGameId,
  generateUuid,
  randomNormal,
  percentageRoll,
  rollSuccess,
  applyDamageVariance,
} from '../utils/randomUtils';

describe('Random Utilities', () => {
  describe('randomInt', () => {
    it('should generate integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should include boundaries', () => {
      const results = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        results.add(randomInt(1, 3));
      }
      expect(results.has(1)).toBe(true);
      expect(results.has(2)).toBe(true);
      expect(results.has(3)).toBe(true);
    });

    it('should handle single value range', () => {
      const result = randomInt(5, 5);
      expect(result).toBe(5);
    });

    it('should handle negative ranges', () => {
      for (let i = 0; i < 10; i++) {
        const result = randomInt(-10, -5);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(-5);
      }
    });
  });

  describe('randomFloat', () => {
    it('should generate float within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(0, 1);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1);
      }
    });

    it('should handle negative ranges', () => {
      for (let i = 0; i < 10; i++) {
        const result = randomFloat(-5.5, -2.5);
        expect(result).toBeGreaterThanOrEqual(-5.5);
        expect(result).toBeLessThan(-2.5);
      }
    });

    it('should handle large ranges', () => {
      const result = randomFloat(0, 1000000);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1000000);
    });
  });

  describe('createSeededRandom', () => {
    it('should produce deterministic results with same seed', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(12345);
      
      for (let i = 0; i < 10; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('should produce different results with different seeds', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(54321);
      
      let different = false;
      for (let i = 0; i < 10; i++) {
        if (rng1() !== rng2()) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });

    it('should generate values between 0 and 1', () => {
      const rng = createSeededRandom(42);
      for (let i = 0; i < 100; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe('randomChoice', () => {
    it('should pick element from array', () => {
      const arr = ['a', 'b', 'c', 'd'];
      for (let i = 0; i < 20; i++) {
        const choice = randomChoice(arr);
        expect(arr).toContain(choice);
      }
    });

    it('should eventually pick all elements', () => {
      const arr = ['a', 'b', 'c'];
      const seen = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        seen.add(randomChoice(arr));
      }
      
      expect(seen.size).toBe(3);
    });

    it('should throw on empty array', () => {
      expect(() => randomChoice([])).toThrow('Cannot pick from empty array');
    });

    it('should handle single element array', () => {
      const arr = ['only'];
      expect(randomChoice(arr)).toBe('only');
    });
  });

  describe('randomChoices', () => {
    it('should pick requested number of elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const choices = randomChoices(arr, 3);
      expect(choices).toHaveLength(3);
      
      // All elements should be from original array
      choices.forEach(choice => {
        expect(arr).toContain(choice);
      });
      
      // Should have no duplicates
      const unique = new Set(choices);
      expect(unique.size).toBe(3);
    });

    it('should return full array when count >= length', () => {
      const arr = [1, 2, 3];
      const choices = randomChoices(arr, 5);
      expect(choices).toHaveLength(3);
      expect(choices.sort()).toEqual([1, 2, 3]);
    });

    it('should handle count of 0', () => {
      const arr = [1, 2, 3];
      const choices = randomChoices(arr, 0);
      expect(choices).toHaveLength(0);
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      randomChoices(arr, 3);
      expect(arr).toEqual(original);
    });
  });

  describe('shuffle', () => {
    it('should maintain all elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...arr]);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should actually shuffle (not always same order)', () => {
      const arr = [1, 2, 3, 4, 5];
      let differentOrder = false;
      
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffle([...arr]);
        if (JSON.stringify(shuffled) !== JSON.stringify(arr)) {
          differentOrder = true;
          break;
        }
      }
      
      expect(differentOrder).toBe(true);
    });

    it('should mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffle(arr);
      expect(result).toBe(arr); // Same reference
    });

    it('should handle empty array', () => {
      const arr: number[] = [];
      expect(shuffle(arr)).toEqual([]);
    });

    it('should handle single element', () => {
      const arr = [42];
      expect(shuffle(arr)).toEqual([42]);
    });
  });

  describe('randomBoolean', () => {
    it('should generate both true and false', () => {
      const results = new Set<boolean>();
      for (let i = 0; i < 100; i++) {
        results.add(randomBoolean());
      }
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });

    it('should respect custom probability', () => {
      let trueCount = 0;
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        if (randomBoolean(0.7)) {
          trueCount++;
        }
      }
      
      const ratio = trueCount / iterations;
      expect(ratio).toBeGreaterThan(0.65);
      expect(ratio).toBeLessThan(0.75);
    });

    it('should always return true with probability 1', () => {
      for (let i = 0; i < 10; i++) {
        expect(randomBoolean(1)).toBe(true);
      }
    });

    it('should always return false with probability 0', () => {
      for (let i = 0; i < 10; i++) {
        expect(randomBoolean(0)).toBe(false);
      }
    });
  });

  describe('weightedRandomChoice', () => {
    it('should select based on weights', () => {
      const items = ['a', 'b', 'c'];
      const weights = [1, 2, 3]; // 'c' should be picked most often
      
      const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
      
      for (let i = 0; i < 600; i++) {
        const choice = weightedRandomChoice(items, weights);
        counts[choice]++;
      }
      
      // 'c' should be picked approximately 3x more than 'a'
      expect(counts.c).toBeGreaterThan(counts.a);
      expect(counts.b).toBeGreaterThan(counts.a);
    });

    it('should handle zero weights', () => {
      const items = ['a', 'b', 'c'];
      const weights = [1, 0, 1]; // 'b' should never be picked
      
      for (let i = 0; i < 100; i++) {
        const choice = weightedRandomChoice(items, weights);
        expect(choice).not.toBe('b');
      }
    });

    it('should throw on mismatched lengths', () => {
      const items = ['a', 'b'];
      const weights = [1, 2, 3];
      
      expect(() => weightedRandomChoice(items, weights))
        .toThrow('Items and weights arrays must have the same length');
    });

    it('should throw on empty arrays', () => {
      expect(() => weightedRandomChoice([], []))
        .toThrow('Cannot choose from empty arrays');
    });

    it('should handle single item', () => {
      const items = ['only'];
      const weights = [42];
      expect(weightedRandomChoice(items, weights)).toBe('only');
    });
  });

  describe('generateGameId', () => {
    it('should generate 6 character ID', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateGameId();
        expect(id).toHaveLength(6);
      }
    });

    it('should only contain uppercase letters and numbers', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateGameId();
        expect(id).toMatch(/^[A-Z0-9]{6}$/);
      }
    });

    it('should generate different IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateGameId());
      }
      // Very unlikely to have duplicates
      expect(ids.size).toBeGreaterThan(95);
    });
  });

  describe('generateUuid', () => {
    it('should generate valid UUID v4 format', () => {
      for (let i = 0; i < 10; i++) {
        const uuid = generateUuid();
        expect(uuid).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      }
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUuid());
      }
      expect(uuids.size).toBe(100);
    });
  });

  describe('randomNormal', () => {
    it('should generate values around mean', () => {
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(randomNormal(50, 10));
      }
      
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      expect(avg).toBeGreaterThan(45);
      expect(avg).toBeLessThan(55);
    });

    it('should respect standard deviation', () => {
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(randomNormal(0, 1));
      }
      
      // About 68% should be within 1 std dev
      const within1StdDev = values.filter(v => Math.abs(v) <= 1).length;
      const percentage = within1StdDev / values.length;
      
      expect(percentage).toBeGreaterThan(0.6);
      expect(percentage).toBeLessThan(0.76);
    });

    it('should handle default parameters', () => {
      const value = randomNormal();
      expect(typeof value).toBe('number');
    });
  });

  describe('percentageRoll', () => {
    it('should generate values between 1 and 100', () => {
      for (let i = 0; i < 100; i++) {
        const roll = percentageRoll();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(100);
        expect(Number.isInteger(roll)).toBe(true);
      }
    });

    it('should eventually generate extremes', () => {
      const rolls = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        rolls.add(percentageRoll());
      }
      expect(rolls.has(1)).toBe(true);
      expect(rolls.has(100)).toBe(true);
    });
  });

  describe('rollSuccess', () => {
    it('should always succeed with 100% chance', () => {
      for (let i = 0; i < 20; i++) {
        expect(rollSuccess(100)).toBe(true);
      }
    });

    it('should never succeed with 0% chance', () => {
      for (let i = 0; i < 20; i++) {
        expect(rollSuccess(0)).toBe(false);
      }
    });

    it('should respect probability', () => {
      let successes = 0;
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        if (rollSuccess(30)) {
          successes++;
        }
      }
      
      const ratio = successes / iterations;
      expect(ratio).toBeGreaterThan(0.25);
      expect(ratio).toBeLessThan(0.35);
    });
  });

  describe('applyDamageVariance', () => {
    it('should apply variance within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = applyDamageVariance(100, 0.1);
        expect(result).toBeGreaterThanOrEqual(90);
        expect(result).toBeLessThanOrEqual(110);
      }
    });

    it('should never return less than 1', () => {
      for (let i = 0; i < 20; i++) {
        const result = applyDamageVariance(1, 0.9);
        expect(result).toBeGreaterThanOrEqual(1);
      }
    });

    it('should handle no variance', () => {
      const result = applyDamageVariance(100, 0);
      expect(result).toBe(100);
    });

    it('should use default variance of 10%', () => {
      for (let i = 0; i < 100; i++) {
        const result = applyDamageVariance(100);
        expect(result).toBeGreaterThanOrEqual(90);
        expect(result).toBeLessThanOrEqual(110);
      }
    });

    it('should return integer values', () => {
      for (let i = 0; i < 10; i++) {
        const result = applyDamageVariance(100, 0.5);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });
});