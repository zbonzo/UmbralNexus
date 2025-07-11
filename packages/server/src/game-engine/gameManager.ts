import { Game, IGame } from '../models/Game';
import { logger } from '../utils/logger';
import { ConnectionManager } from '../websocket/connectionManager';
import type { 
  GameConfig, 
  Player, 
  GameState, 
  PlayerAction,
  CharacterClass 
} from '@umbral-nexus/shared';

export class GameManager {
  private connectionManager: ConnectionManager;
  private activeGames: Map<string, IGame> = new Map();

  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  public async createGame(config: {
    name: string;
    hostId: string;
    playerCap: number;
    difficulty: 'normal' | 'hard' | 'nightmare';
    endConditions: GameConfig['endConditions'];
  }): Promise<{ gameId: string; game: IGame }> {
    try {
      const gameId = this.generateGameId();
      
      const gameConfig: GameConfig = {
        playerCap: config.playerCap,
        difficulty: config.difficulty,
        endConditions: config.endConditions,
      };

      logger.debug('Creating game with config:', { gameId, config: gameConfig });

      const game = new Game({
        gameId,
        name: config.name,
        host: config.hostId,
        config: gameConfig,
        players: [],
        floors: [],
        currentPhase: 'lobby',
      });

      logger.debug('Game model created, attempting to save...');
      await game.save();
      logger.debug('Game saved successfully');
      
      this.activeGames.set(gameId, game);

      logger.info(`Game created: ${gameId} by host ${config.hostId}`);
      
      return { gameId, game };
    } catch (error) {
      logger.error('Error creating game:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        config,
      });
      throw new Error(`Failed to create game: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async joinGame(gameId: string, player: {
    playerId: string;
    name: string;
    class: CharacterClass;
  }): Promise<IGame> {
    try {
      let game = this.activeGames.get(gameId);
      
      if (!game) {
        game = await Game.findOne({ gameId });
        if (!game) {
          throw new Error('Game not found');
        }
        this.activeGames.set(gameId, game);
      }

      if (game.currentPhase !== 'lobby') {
        throw new Error('Game is not in lobby phase');
      }

      if (game.players.length >= game.config.playerCap) {
        throw new Error('Game is full');
      }

      if (game.players.some((p: Player) => p.playerId === player.playerId)) {
        throw new Error('Player already in game');
      }

      // Create player with starting stats based on class
      const newPlayer: Player = {
        playerId: player.playerId,
        name: player.name,
        class: player.class,
        level: 1,
        health: this.getStartingHealth(player.class),
        maxHealth: this.getStartingHealth(player.class),
        position: { floor: 0, x: 0, y: 0 },
        joinedAt: new Date(),
        abilities: this.getStartingAbilities(player.class),
        nexusEchoes: [],
        inventory: [],
        actionPoints: 3,
      };

      game.players.push(newPlayer);
      await game.save();

      // Broadcast game state update
      this.broadcastGameState(gameId);

      logger.info(`Player ${player.playerId} joined game ${gameId}`);
      
      return game;
    } catch (error) {
      logger.error(`Error joining game ${gameId}:`, error);
      throw error;
    }
  }

  public async leaveGame(gameId: string, playerId: string): Promise<void> {
    try {
      const game = this.activeGames.get(gameId);
      if (!game) {
        return;
      }

      const playerIndex = game.players.findIndex((p: Player) => p.playerId === playerId);
      if (playerIndex === -1) {
        return;
      }

      game.players.splice(playerIndex, 1);
      await game.save();

      // If game is empty, clean up
      if (game.players.length === 0) {
        this.activeGames.delete(gameId);
        await Game.deleteOne({ gameId });
        logger.info(`Empty game ${gameId} deleted`);
        return;
      }

      // If host left, assign new host
      if (game.host === playerId && game.players.length > 0) {
        game.host = game.players[0].playerId;
        await game.save();
        logger.info(`New host assigned for game ${gameId}: ${game.host}`);
      }

      // Broadcast game state update
      this.broadcastGameState(gameId);

      logger.info(`Player ${playerId} left game ${gameId}`);
    } catch (error) {
      logger.error(`Error leaving game ${gameId}:`, error);
    }
  }

  public async startGame(gameId: string, hostId: string): Promise<void> {
    try {
      const game = this.activeGames.get(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      if (game.host !== hostId) {
        throw new Error('Only the host can start the game');
      }

      if (game.players.length === 0) {
        throw new Error('Cannot start game with no players');
      }

      game.currentPhase = 'active';
      game.startTime = Date.now();
      await game.save();

      // Initialize first floor
      await this.initializeFirstFloor(game);

      // Broadcast game start
      this.connectionManager.broadcastToGame(gameId, 'game-started', {
        gameId,
        startTime: game.startTime,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Game ${gameId} started by host ${hostId}`);
    } catch (error) {
      logger.error(`Error starting game ${gameId}:`, error);
      throw error;
    }
  }

  public async processPlayerAction(gameId: string, playerId: string, action: PlayerAction): Promise<void> {
    try {
      const game = this.activeGames.get(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      if (game.currentPhase !== 'active') {
        throw new Error('Game is not active');
      }

      const player = game.players.find((p: Player) => p.playerId === playerId);
      if (!player) {
        throw new Error('Player not found in game');
      }

      // Process action based on type
      switch (action.type) {
        case 'MOVE':
          await this.processMovement(game, player, action);
          break;
        case 'ATTACK':
          await this.processAttack(game, player, action);
          break;
        case 'USE_ABILITY':
          await this.processAbility(game, player, action);
          break;
        case 'USE_ITEM':
          await this.processItem(game, player, action);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      await game.save();
      this.broadcastGameState(gameId);

    } catch (error) {
      logger.error(`Error processing action in game ${gameId}:`, error);
      throw error;
    }
  }

  private async processMovement(game: IGame, player: Player, action: PlayerAction): Promise<void> {
    if (action.type !== 'MOVE') return;

    const { direction } = action;
    const { x, y } = player.position;

    // Calculate new position based on direction
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up':
        newY -= 1;
        break;
      case 'down':
        newY += 1;
        break;
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
    }

    // Validate movement (basic bounds checking)
    if (newX < 0 || newX >= 20 || newY < 0 || newY >= 20) {
      throw new Error('Invalid movement: out of bounds');
    }

    // Check if player has enough AP
    if (player.actionPoints < 1) {
      throw new Error('Not enough action points');
    }

    // Apply movement
    player.position.x = newX;
    player.position.y = newY;
    player.actionPoints -= 1;

    logger.debug(`Player ${player.playerId} moved to (${newX}, ${newY})`);
    
    // Broadcast position update to all players in the game
    this.broadcastPlayerPosition(game.gameId, player);
  }

  private async processAttack(game: IGame, player: Player, action: PlayerAction): Promise<void> {
    if (action.type !== 'ATTACK') return;
    
    // Basic attack implementation
    if (player.actionPoints < 1) {
      throw new Error('Not enough action points');
    }

    player.actionPoints -= 1;
    logger.debug(`Player ${player.playerId} attacked`);
  }

  private async processAbility(game: IGame, player: Player, action: PlayerAction): Promise<void> {
    if (action.type !== 'USE_ABILITY') return;

    const { abilityId } = action;
    const ability = player.abilities.find(a => a.id === abilityId);
    
    if (!ability) {
      throw new Error('Ability not found');
    }

    if (player.actionPoints < ability.cost) {
      throw new Error('Not enough action points');
    }

    player.actionPoints -= ability.cost;
    logger.debug(`Player ${player.playerId} used ability ${abilityId}`);
  }

  private async processItem(game: IGame, player: Player, action: PlayerAction): Promise<void> {
    if (action.type !== 'USE_ITEM') return;

    const { itemId } = action;
    const item = player.inventory.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.quantity <= 0) {
      throw new Error('Item quantity is zero');
    }

    item.quantity -= 1;
    if (item.quantity === 0) {
      player.inventory = player.inventory.filter(i => i.id !== itemId);
    }

    logger.debug(`Player ${player.playerId} used item ${itemId}`);
  }

  private async initializeFirstFloor(game: IGame): Promise<void> {
    // Basic floor initialization
    const floor = {
      id: 1,
      name: 'Starting Floor',
      theme: 'dungeon',
      tiles: [], // Would be populated by map generator
      enemies: [],
      items: [],
      stairs: { up: null, down: { floor: 2, x: 10, y: 10 } },
    };

    game.floors = [floor];
    await game.save();
  }

  private broadcastGameState(gameId: string): void {
    const game = this.activeGames.get(gameId);
    if (!game) return;

    const gameState: GameState = {
      gameId: game.gameId,
      name: game.name,
      host: game.host,
      config: game.config,
      players: game.players,
      floors: game.floors,
      currentPhase: game.currentPhase,
      startTime: game.startTime,
      currentFloor: 1,
    };

    this.connectionManager.broadcastToGame(gameId, 'game-state', gameState);
  }

  private broadcastPlayerPosition(gameId: string, player: Player): void {
    const positionUpdate = {
      playerId: player.playerId,
      position: player.position,
      actionPoints: player.actionPoints,
    };

    this.connectionManager.broadcastToGame(gameId, 'player-position', positionUpdate);
  }

  private generateGameId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getStartingHealth(characterClass: CharacterClass): number {
    switch (characterClass) {
      case 'warrior':
        return 120;
      case 'ranger':
        return 80;
      case 'mage':
        return 60;
      case 'cleric':
        return 100;
      default:
        return 80;
    }
  }

  private getStartingAbilities(characterClass: CharacterClass): any[] {
    // Basic starting abilities based on class
    switch (characterClass) {
      case 'warrior':
        return [
          { id: 'shield-bash', name: 'Shield Bash', description: 'Stun enemy', cost: 1, cooldown: 0, range: 1 },
          { id: 'rallying-cry', name: 'Rallying Cry', description: 'Boost ally damage', cost: 2, cooldown: 3, range: 5 },
        ];
      case 'ranger':
        return [
          { id: 'quick-shot', name: 'Quick Shot', description: 'Fast ranged attack', cost: 1, cooldown: 0, range: 5 },
          { id: 'mark-target', name: 'Mark Target', description: 'Mark enemy for extra damage', cost: 2, cooldown: 2, range: 7 },
        ];
      case 'mage':
        return [
          { id: 'frost-bolt', name: 'Frost Bolt', description: 'Slow enemy', cost: 1, cooldown: 0, range: 6 },
          { id: 'teleport', name: 'Teleport', description: 'Instantly move', cost: 2, cooldown: 4, range: 8 },
        ];
      case 'cleric':
        return [
          { id: 'heal', name: 'Heal', description: 'Restore ally health', cost: 1, cooldown: 0, range: 3 },
          { id: 'blessing', name: 'Blessing', description: 'Reduce damage taken', cost: 2, cooldown: 3, range: 4 },
        ];
      default:
        return [];
    }
  }

  // Public getters for external access
  public getGame(gameId: string): IGame | undefined {
    return this.activeGames.get(gameId);
  }

  public getActiveGameCount(): number {
    return this.activeGames.size;
  }

  public async cleanup(): Promise<void> {
    this.activeGames.clear();
    logger.info('GameManager cleanup completed');
  }
}