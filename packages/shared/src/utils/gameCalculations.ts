import type { Player, Ability } from '../types/game';
import {
  COMBAT_CONSTANTS,
  CLASS_MODIFIERS,
  LEVEL_PROGRESSION,
  NEXUS_ECHO_MODIFIERS,
  EXPERIENCE_CONSTANTS,
  ACTION_POINT_CONSTANTS
} from '../constants';

/**
 * Calculates damage dealt by an attacker to a target using a multi-factor formula.
 * 
 * Damage calculation factors:
 * 1. Base damage (10 for basic attacks, or ability-specific)
 * 2. Class modifier (Warrior: 1.2x, Ranger: 1.1x, Mage: 1.3x, Cleric: 0.8x)
 * 3. Level scaling (+5% per level above 1)
 * 4. Nexus Echo multipliers (+10% per offensive echo)
 * 5. Random variance (±10%)
 * 
 * @param attacker - Player performing the attack
 * @param _target - Player or enemy receiving damage (health stats used for future armor calculations)
 * @param ability - Optional ability being used. If not provided, uses basic attack damage
 * @returns Final damage amount (minimum 1)
 * 
 * @example
 * ```ts
 * // Basic attack from level 3 warrior
 * const damage = calculateDamage(warriorPlayer, enemyTarget);
 * // Result: ~15-18 damage (10 base * 1.2 warrior * 1.1 level * ±10%)
 * 
 * // Ability attack with offensive Nexus Echo
 * const damage = calculateDamage(mageWithEcho, enemy, fireballAbility);
 * // Result: ~40-48 damage (25 base * 1.3 mage * 1.1 echo * ±10%)
 * ```
 */
export function calculateDamage(
  attacker: Player,
  _target: { health: number; maxHealth: number },
  ability?: Ability
): number {
  // Base damage calculation
  let baseDamage: number = COMBAT_CONSTANTS.BASE_ATTACK_DAMAGE;
  
  if (ability) {
    // Use ability's damage value if available, otherwise scale with cooldown
    const abilityDamage = ability.damageOrHeal ?? 
      (ability.cooldownTime / COMBAT_CONSTANTS.DAMAGE_COOLDOWN_DIVISOR) * COMBAT_CONSTANTS.DAMAGE_COOLDOWN_MULTIPLIER;
    baseDamage = abilityDamage;
  }
  
  // Class-based damage modifiers
  const modifier = (CLASS_MODIFIERS.DAMAGE as any)[attacker.class] || 1.0;
  
  // Apply level scaling
  const levelMultiplier = 1 + ((attacker.level - 1) * LEVEL_PROGRESSION.SCALING_PER_LEVEL);
  
  // Apply Nexus Echo multipliers
  let echoMultiplier = 1.0;
  attacker.nexusEchoes.forEach(echo => {
    if (echo.type === 'offensive') {
      echoMultiplier += NEXUS_ECHO_MODIFIERS.OFFENSIVE_DAMAGE_BONUS;
    }
  });
  
  // Calculate final damage
  const finalDamage = Math.floor(baseDamage * modifier * levelMultiplier * echoMultiplier);
  
  // Add some randomness
  const variance = COMBAT_CONSTANTS.DAMAGE_VARIANCE_MAX - COMBAT_CONSTANTS.DAMAGE_VARIANCE_MIN;
  const randomFactor = COMBAT_CONSTANTS.DAMAGE_VARIANCE_MIN + (Math.random() * variance);
  
  return Math.max(COMBAT_CONSTANTS.MINIMUM_DAMAGE, Math.floor(finalDamage * randomFactor));
}

/**
 * Calculates healing amount for restorative abilities.
 * 
 * Healing calculation factors:
 * 1. Base healing (ability-specific or scales with cooldown)
 * 2. Class bonus (Clerics get 1.5x healing power)
 * 3. Level scaling (+5% per level above 1)
 * 4. Nexus Echo multipliers (+15% per defensive echo)
 * 
 * @param healer - Player casting the healing ability
 * @param target - Player receiving the healing (cannot exceed max HP)
 * @param ability - Healing ability being used
 * @returns Actual healing applied (capped at target's missing health)
 * 
 * @example
 * ```ts
 * // Level 5 cleric with 2 defensive echoes healing a wounded ally
 * const healing = calculateHealing(cleric, woundedPlayer, healAbility);
 * // Base 20 * 1.5 cleric * 1.2 level * 1.3 echoes = 46 healing
 * ```
 */
export function calculateHealing(
  healer: Player,
  target: Player,
  ability: Ability
): number {
  // Base healing uses ability's healing value or scales with cooldown
  let baseHealing = ability.damageOrHeal || 
    (ability.cooldownTime / COMBAT_CONSTANTS.DAMAGE_COOLDOWN_DIVISOR) * COMBAT_CONSTANTS.HEALING_COOLDOWN_MULTIPLIER;
  
  // Class-based healing modifiers
  const healingModifier = (CLASS_MODIFIERS.HEALING as any)[healer.class] || 1.0;
  baseHealing *= healingModifier;
  
  // Level scaling
  const levelMultiplier = 1 + ((healer.level - 1) * LEVEL_PROGRESSION.SCALING_PER_LEVEL);
  
  // Apply defensive Nexus Echoes for healing bonus
  let echoMultiplier = 1.0;
  healer.nexusEchoes.forEach(echo => {
    if (echo.type === 'defensive') {
      echoMultiplier += NEXUS_ECHO_MODIFIERS.DEFENSIVE_HEALING_BONUS;
    }
  });
  
  const finalHealing = Math.floor(baseHealing * levelMultiplier * echoMultiplier);
  
  // Can't heal above max health
  const maxPossibleHealing = target.maxHealth - target.health;
  
  return Math.min(finalHealing, maxPossibleHealing);
}

/**
 * Validates whether a player can currently use a specific ability.
 * 
 * Checks performed:
 * 1. Cooldown status - ability must not be on cooldown
 * 2. Player state - player must be alive (health > 0)
 * 
 * Future checks to implement:
 * - Sufficient action points
 * - Valid target in range
 * - Required resources (mana, stamina, etc.)
 * 
 * @param player - Player attempting to use the ability
 * @param ability - Ability to validate
 * @returns `true` if all conditions are met, `false` otherwise
 */
export function canUseAbility(player: Player, ability: Ability): boolean {
  // Check if ability is on cooldown
  const cooldownEnd = player.abilityCooldowns[ability.id] || 0;
  if (Date.now() < cooldownEnd) {
    return false;
  }
  
  // Check if player is alive
  if (player.health <= COMBAT_CONSTANTS.DEATH_THRESHOLD) {
    return false;
  }
  
  return true;
}

/**
 * Calculates action point cost for movement across the hex grid.
 * 
 * Current implementation: 1 AP per hex tile (linear cost)
 * 
 * Future enhancements:
 * - Terrain modifiers (swamp +1 AP, road -0.5 AP)
 * - Diagonal movement optimization
 * - Sprint mode (2x speed for 3x AP cost)
 * - Nexus Echo movement bonuses
 * 
 * @param distance - Number of hex tiles to traverse
 * @returns Action point cost (minimum 1)
 */
export function calculateMovementCost(distance: number): number {
  // Base cost: 1 AP per tile
  return Math.max(ACTION_POINT_CONSTANTS.MINIMUM_AP_COST, distance * ACTION_POINT_CONSTANTS.MOVEMENT_COST_PER_TILE);
}

/**
 * Calculates experience points gained from defeating an enemy.
 * 
 * XP calculation formula:
 * - Base XP = enemyLevel × 10
 * - Level difference bonus: +10% per level the enemy is above player
 * - Level difference penalty: -10% per level below player (min 10% of base)
 * - Group kill modifier: -30% when XP is shared among party
 * 
 * @param playerLevel - Current level of the player gaining XP
 * @param enemyLevel - Level of the defeated enemy
 * @param isGroupKill - Whether multiple players participated in the kill
 * @returns Experience points gained (floored to integer)
 * 
 * @example
 * ```ts
 * // Level 5 player defeats level 7 enemy solo
 * calculateExperienceGain(5, 7, false); // 84 XP (70 base + 20% bonus)
 * 
 * // Same kill but in a group
 * calculateExperienceGain(5, 7, true); // 58 XP (84 * 0.7)
 * ```
 */
export function calculateExperienceGain(
  playerLevel: number,
  enemyLevel: number,
  isGroupKill: boolean = false
): number {
  // Base XP scales with enemy level
  let baseXP = enemyLevel * EXPERIENCE_CONSTANTS.BASE_XP_MULTIPLIER;
  
  // Level difference modifier
  const levelDiff = enemyLevel - playerLevel;
  if (levelDiff > 0) {
    // Bonus XP for fighting higher level enemies
    baseXP *= 1 + (levelDiff * EXPERIENCE_CONSTANTS.LEVEL_DIFFERENCE_MODIFIER);
  } else if (levelDiff < EXPERIENCE_CONSTANTS.XP_PENALTY_THRESHOLD) {
    // Reduced XP for fighting much lower level enemies
    baseXP *= Math.max(
      EXPERIENCE_CONSTANTS.MINIMUM_XP_PERCENTAGE, 
      1 + (levelDiff * EXPERIENCE_CONSTANTS.LEVEL_DIFFERENCE_MODIFIER)
    );
  }
  
  // Group kill penalty (XP is shared)
  if (isGroupKill) {
    baseXP *= EXPERIENCE_CONSTANTS.GROUP_KILL_PENALTY;
  }
  
  return Math.floor(baseXP);
}

/**
 * Converts total accumulated experience points into player level.
 * 
 * Level progression formula: level = floor(sqrt(XP / 100)) + 1
 * 
 * This creates an exponential XP curve where each level requires
 * increasingly more XP than the last:
 * - Level 1: 0 XP
 * - Level 2: 100 XP
 * - Level 3: 400 XP
 * - Level 4: 900 XP
 * - Level 5: 1,600 XP
 * 
 * @param totalXP - Total experience points accumulated
 * @returns Player level (minimum 1, handles negative XP gracefully)
 */
export function calculateLevelFromExperience(totalXP: number): number {
  // Exponential leveling curve: level = sqrt(XP / divisor)
  // Handle negative XP by treating as 0
  const safeXP = Math.max(0, totalXP);
  return Math.max(
    LEVEL_PROGRESSION.MINIMUM_LEVEL, 
    Math.floor(Math.sqrt(safeXP / LEVEL_PROGRESSION.XP_REQUIREMENT_DIVISOR)) + 1
  );
}

/**
 * Calculates the total experience points required to reach a specific level.
 * 
 * This is the inverse of calculateLevelFromExperience:
 * XP = (level - 1)² × 100
 * 
 * @param level - Target level to calculate XP requirement for
 * @returns Total XP needed to reach that level
 * 
 * @example
 * ```ts
 * calculateExperienceRequired(5); // 1,600 XP
 * calculateExperienceRequired(10); // 8,100 XP
 * calculateExperienceRequired(20); // 36,100 XP
 * ```
 */
export function calculateExperienceRequired(level: number): number {
  // Inverse of level calculation
  return Math.pow(level - 1, 2) * LEVEL_PROGRESSION.XP_REQUIREMENT_DIVISOR;
}