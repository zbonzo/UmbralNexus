import type { Player, Ability } from '../types/game';

/**
 * Calculate damage dealt by an attacker to a target
 * @param attacker Player performing the attack
 * @param _target Player or enemy receiving damage
 * @param ability Ability being used (optional for basic attacks)
 * @returns Calculated damage amount
 */
export function calculateDamage(
  attacker: Player,
  _target: { health: number; maxHealth: number },
  ability?: Ability
): number {
  // Base damage calculation
  let baseDamage = 10; // Default basic attack damage
  
  if (ability) {
    // Ability-based damage scales with cost
    baseDamage = ability.cost * 15;
  }
  
  // Class-based damage modifiers
  const classModifiers: Record<string, number> = {
    warrior: 1.2,  // 20% more damage
    ranger: 1.1,   // 10% more damage
    mage: 1.3,     // 30% more damage but lower HP
    cleric: 0.8,   // 20% less damage, focuses on healing
  };
  
  const modifier = classModifiers[attacker.class] || 1.0;
  
  // Apply level scaling (5% per level above 1)
  const levelMultiplier = 1 + ((attacker.level - 1) * 0.05);
  
  // Apply Nexus Echo multipliers
  let echoMultiplier = 1.0;
  attacker.nexusEchoes.forEach(echo => {
    if (echo.type === 'offensive') {
      echoMultiplier += 0.1; // 10% damage increase per offensive echo
    }
  });
  
  // Calculate final damage
  const finalDamage = Math.floor(baseDamage * modifier * levelMultiplier * echoMultiplier);
  
  // Add some randomness (±10%)
  const randomFactor = 0.9 + (Math.random() * 0.2);
  
  return Math.max(1, Math.floor(finalDamage * randomFactor));
}

/**
 * Calculate healing amount for healing abilities
 * @param healer Player performing the heal
 * @param target Player receiving healing
 * @param ability Healing ability being used
 * @returns Calculated healing amount
 */
export function calculateHealing(
  healer: Player,
  target: Player,
  ability: Ability
): number {
  // Base healing scales with ability cost
  let baseHealing = ability.cost * 20;
  
  // Cleric gets bonus healing
  if (healer.class === 'cleric') {
    baseHealing *= 1.5;
  }
  
  // Level scaling
  const levelMultiplier = 1 + ((healer.level - 1) * 0.05);
  
  // Apply defensive Nexus Echoes for healing bonus
  let echoMultiplier = 1.0;
  healer.nexusEchoes.forEach(echo => {
    if (echo.type === 'defensive') {
      echoMultiplier += 0.15; // 15% healing increase per defensive echo
    }
  });
  
  const finalHealing = Math.floor(baseHealing * levelMultiplier * echoMultiplier);
  
  // Can't heal above max health
  const maxPossibleHealing = target.maxHealth - target.health;
  
  return Math.min(finalHealing, maxPossibleHealing);
}

/**
 * Check if a player can use a specific ability
 * @param player Player attempting to use ability
 * @param ability Ability to check
 * @returns True if ability can be used
 */
export function canUseAbility(player: Player, ability: Ability): boolean {
  // Check if player has enough action points
  if (player.actionPoints < ability.cost) {
    return false;
  }
  
  // Check if ability is on cooldown (would need cooldown tracking)
  // This would be implemented with a separate cooldown system
  
  // Check if player is alive
  if (player.health <= 0) {
    return false;
  }
  
  return true;
}

/**
 * Calculate action point cost for movement
 * @param distance Number of tiles to move
 * @returns Action point cost
 */
export function calculateMovementCost(distance: number): number {
  // Base cost: 1 AP per tile
  return Math.max(1, distance);
}

/**
 * Calculate experience gained from defeating an enemy
 * @param playerLevel Current player level
 * @param enemyLevel Enemy level
 * @param isGroupKill Whether this was a group kill (shared XP)
 * @returns Experience points gained
 */
export function calculateExperienceGain(
  playerLevel: number,
  enemyLevel: number,
  isGroupKill: boolean = false
): number {
  // Base XP scales with enemy level
  let baseXP = enemyLevel * 10;
  
  // Level difference modifier
  const levelDiff = enemyLevel - playerLevel;
  if (levelDiff > 0) {
    // Bonus XP for fighting higher level enemies
    baseXP *= 1 + (levelDiff * 0.1);
  } else if (levelDiff < -2) {
    // Reduced XP for fighting much lower level enemies
    baseXP *= Math.max(0.1, 1 + (levelDiff * 0.1));
  }
  
  // Group kill penalty (XP is shared)
  if (isGroupKill) {
    baseXP *= 0.7; // 30% penalty for group kills
  }
  
  return Math.floor(baseXP);
}

/**
 * Calculate level from total experience
 * @param totalXP Total experience points
 * @returns Player level
 */
export function calculateLevelFromExperience(totalXP: number): number {
  // Exponential leveling curve: level = sqrt(XP / 100)
  return Math.max(1, Math.floor(Math.sqrt(totalXP / 100)) + 1);
}

/**
 * Calculate total XP required for a specific level
 * @param level Target level
 * @returns Total XP required
 */
export function calculateExperienceRequired(level: number): number {
  // Inverse of level calculation
  return Math.pow(level - 1, 2) * 100;
}