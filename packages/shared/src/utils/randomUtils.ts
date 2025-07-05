/**
 * Generate a random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random float
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a seeded random number generator
 * @param seed Seed value for deterministic randomness
 * @returns Random number generator function
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  
  return function() {
    // Linear congruential generator
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Pick a random element from an array
 * @param array Array to pick from
 * @returns Random element
 */
export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  return array[randomInt(0, array.length - 1)]!;
}

/**
 * Pick multiple random elements from an array without replacement
 * @param array Array to pick from
 * @param count Number of elements to pick
 * @returns Array of random elements
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return [...array];
  }
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  
  return shuffled.slice(0, count);
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param array Array to shuffle
 * @returns Shuffled array (mutates original)
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

/**
 * Generate a random boolean with given probability
 * @param probability Probability of returning true (0-1)
 * @returns Random boolean
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Generate a weighted random choice
 * @param items Array of items to choose from
 * @param weights Array of weights (same length as items)
 * @returns Randomly selected item based on weights
 */
export function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  if (items.length === 0) {
    throw new Error('Cannot choose from empty arrays');
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (let i = 0; i < items.length; i++) {
    currentWeight += weights[i]!;
    if (randomWeight <= currentWeight) {
      return items[i]!;
    }
  }
  
  // Fallback to last item (shouldn't happen with valid weights)
  return items[items.length - 1]!;
}

/**
 * Generate a random game ID (6 alphanumeric characters)
 * @returns Random game ID
 */
export function generateGameId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(randomInt(0, chars.length - 1));
  }
  return result;
}

/**
 * Generate a random UUID v4
 * @returns Random UUID
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a random number with normal distribution (Box-Muller transform)
 * @param mean Mean value
 * @param stdDev Standard deviation
 * @returns Random number with normal distribution
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return z0 * stdDev + mean;
}

/**
 * Generate a random percentage roll (1-100)
 * @returns Random percentage
 */
export function percentageRoll(): number {
  return randomInt(1, 100);
}

/**
 * Check if a percentage roll succeeds
 * @param chance Success chance (1-100)
 * @returns True if roll succeeds
 */
export function rollSuccess(chance: number): boolean {
  return percentageRoll() <= chance;
}

/**
 * Generate random damage variance (±variance%)
 * @param baseDamage Base damage amount
 * @param variance Variance percentage (0-1)
 * @returns Damage with random variance applied
 */
export function applyDamageVariance(baseDamage: number, variance: number = 0.1): number {
  const multiplier = 1 + randomFloat(-variance, variance);
  return Math.max(1, Math.floor(baseDamage * multiplier));
}