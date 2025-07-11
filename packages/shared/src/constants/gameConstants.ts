/**
 * Comprehensive game constants to replace magic numbers throughout the codebase.
 * All game mechanics values should be defined here for easy balancing and configuration.
 */

// ============================================================================
// COMBAT CONSTANTS
// ============================================================================

export const COMBAT_CONSTANTS = {
  /** Base damage for basic attacks (no ability used) */
  BASE_ATTACK_DAMAGE: 10,
  
  /** Minimum damage that can be dealt */
  MINIMUM_DAMAGE: 1,
  
  /** Damage calculation from ability cooldown (damage = cooldown_ms / 1000 * multiplier) */
  DAMAGE_COOLDOWN_DIVISOR: 1000,
  DAMAGE_COOLDOWN_MULTIPLIER: 5,
  
  /** Healing calculation from ability cooldown */
  HEALING_COOLDOWN_MULTIPLIER: 6,
  
  /** Random damage variance range (±10%) */
  DAMAGE_VARIANCE_MIN: 0.9,
  DAMAGE_VARIANCE_MAX: 1.1,
  
  /** Dead state threshold */
  DEATH_THRESHOLD: 0,
} as const;

// ============================================================================
// CHARACTER CLASS CONSTANTS
// ============================================================================

export const CLASS_MODIFIERS = {
  /** Damage multipliers by class */
  DAMAGE: {
    warrior: 1.2,   // Tank with decent damage
    ranger: 1.1,    // Balanced ranged DPS
    mage: 1.3,      // Glass cannon
    cleric: 0.8,    // Support role, reduced damage
  },
  
  /** Healing multipliers by class */
  HEALING: {
    cleric: 1.5,    // Specialized healer bonus
    warrior: 1.0,   // Default healing
    ranger: 1.0,    // Default healing
    mage: 1.0,      // Default healing
  },
  
  /** Starting health by class */
  STARTING_HEALTH: {
    warrior: 120,   // High HP tank
    ranger: 80,     // Medium HP
    mage: 60,       // Low HP glass cannon
    cleric: 100,    // High HP support
  },
  
  /** Base visibility range by class (in tiles) */
  VISIBILITY_RANGE: {
    warrior: 3,     // Close combat focus
    ranger: 5,      // Scout role
    mage: 4,        // Balanced
    cleric: 4,      // Support needs awareness
  },
} as const;

// ============================================================================
// LEVEL PROGRESSION CONSTANTS
// ============================================================================

export const LEVEL_PROGRESSION = {
  /** Damage/healing increase per level (5% per level above 1) */
  SCALING_PER_LEVEL: 0.05,
  
  /** Visibility range increase (every N levels) */
  VISIBILITY_BONUS_INTERVAL: 5,
  VISIBILITY_BONUS_AMOUNT: 1,
  
  /** XP required divisor (XP = (level-1)² * divisor) */
  XP_REQUIREMENT_DIVISOR: 100,
  
  /** Minimum level */
  MINIMUM_LEVEL: 1,
} as const;

// ============================================================================
// NEXUS ECHO CONSTANTS
// ============================================================================

export const NEXUS_ECHO_MODIFIERS = {
  /** Damage increase per offensive echo */
  OFFENSIVE_DAMAGE_BONUS: 0.1,    // 10% per echo
  
  /** Healing increase per defensive echo */
  DEFENSIVE_HEALING_BONUS: 0.15,  // 15% per echo
  
  /** Maximum echoes per player */
  MAX_ECHOES_PER_PLAYER: 10,
} as const;

// ============================================================================
// EXPERIENCE CONSTANTS
// ============================================================================

export const EXPERIENCE_CONSTANTS = {
  /** Base XP = enemy level * multiplier */
  BASE_XP_MULTIPLIER: 10,
  
  /** XP modifier per level difference */
  LEVEL_DIFFERENCE_MODIFIER: 0.1,
  
  /** Minimum XP percentage when fighting lower level enemies */
  MINIMUM_XP_PERCENTAGE: 0.1,
  
  /** Group kill XP penalty (shared XP) */
  GROUP_KILL_PENALTY: 0.7,        // 30% reduction
  
  /** Level difference threshold for XP penalty */
  XP_PENALTY_THRESHOLD: -2,
} as const;

// ============================================================================
// ACTION POINT CONSTANTS
// ============================================================================

export const ACTION_POINT_CONSTANTS = {
  /** Starting action points per turn */
  DEFAULT_AP_COUNT: 3,
  
  /** AP cost per tile of movement */
  MOVEMENT_COST_PER_TILE: 1,
  
  /** Minimum AP cost for any action */
  MINIMUM_AP_COST: 1,
  
  /** Basic attack AP cost */
  BASIC_ATTACK_COST: 1,
} as const;

// ============================================================================
// GAME CONFIGURATION CONSTANTS
// ============================================================================

export const GAME_CONFIG_CONSTANTS = {
  /** Player limits */
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 20,
  
  /** Game ID format */
  GAME_ID_LENGTH: 6,
  GAME_ID_CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  
  /** Name length limits */
  MIN_NAME_LENGTH: 1,
  MAX_GAME_NAME_LENGTH: 50,
  MAX_PLAYER_NAME_LENGTH: 20,
  
  /** Turn timer (seconds) */
  TURN_TIME_LIMIT: 30,
  
  /** Map dimensions */
  DEFAULT_MAP_WIDTH: 20,
  DEFAULT_MAP_HEIGHT: 20,
  
  /** Starting positions */
  DEFAULT_SPAWN_X: 10,
  DEFAULT_SPAWN_Y: 10,
  DEFAULT_STARTING_FLOOR: 1,
  
  /** Database TTL (24 hours in seconds) */
  GAME_TTL_SECONDS: 86400,
} as const;

// ============================================================================
// WEBSOCKET CONSTANTS
// ============================================================================

export const WEBSOCKET_CONSTANTS = {
  /** Connection timeouts (milliseconds) */
  PING_TIMEOUT: 60000,        // 60 seconds
  PING_INTERVAL: 25000,       // 25 seconds
  UPGRADE_TIMEOUT: 10000,     // 10 seconds
  HEARTBEAT_TIMEOUT: 30000,   // 30 seconds
  HEARTBEAT_CHECK_INTERVAL: 10000, // 10 seconds
  
  /** Buffer limits */
  MAX_HTTP_BUFFER_SIZE: 1e6,  // 1MB
  
  /** Message limits */
  MAX_CHAT_MESSAGE_LENGTH: 200,
  MAX_MESSAGES_PER_MINUTE: 30,
  
  /** Reconnection */
  RECONNECT_TIMEOUT: 300000,  // 5 minutes
} as const;

// ============================================================================
// HTTP API CONSTANTS
// ============================================================================

export const API_CONSTANTS = {
  /** Port configuration */
  DEFAULT_PORT: 8888,
  
  /** CORS */
  ALLOWED_ORIGINS: ['http://localhost:5173', 'http://localhost:5174'],
  
  /** Request limits */
  MAX_REQUEST_SIZE: '1mb',
  
  /** Rate limiting */
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  WS_RATE_LIMIT_WINDOW_MS: 1000,         // 1 second
  WS_RATE_LIMIT_MAX_MESSAGES: 10,
} as const;

// ============================================================================
// ABILITY CONSTANTS
// ============================================================================

export const ABILITY_CONSTANTS = {
  /** Ability ranges (in tiles) */
  MELEE_RANGE: 1,
  SHORT_RANGE: 3,
  MEDIUM_RANGE: 5,
  LONG_RANGE: 8,
  
  /** Ability cooldowns (milliseconds) */
  SHORT_COOLDOWN: 1000,    // 1 second
  MEDIUM_COOLDOWN: 3000,   // 3 seconds
  LONG_COOLDOWN: 5000,     // 5 seconds
  ULTIMATE_COOLDOWN: 10000, // 10 seconds
  
  /** Ability costs (AP) */
  LOW_COST: 1,
  MEDIUM_COST: 2,
  HIGH_COST: 3,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/** Valid character classes */
export type CharacterClassName = keyof typeof CLASS_MODIFIERS.DAMAGE;

/** Valid difficulty levels */
export type DifficultyLevel = 'normal' | 'hard' | 'nightmare';

/** Valid game phases */
export type GamePhase = 'lobby' | 'active' | 'victory' | 'defeat';

/** Valid end condition types */
export type EndConditionType = 'TIME_LIMIT' | 'DEATH_COUNT' | 'FLOOR_COUNT';