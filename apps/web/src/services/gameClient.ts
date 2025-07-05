import { SocketClient, SocketMessage } from './socketClient';
import type {
  GameConfig,
  Player,
  Ability,
  GameState,
  GameError,
  Direction
} from '@umbral-nexus/shared';

export class GameClient {
  private socketClient: SocketClient;
  private currentPlayer: Player | null = null;
  private gameState: GameState | null = null;
  private actionQueue: any[] = [];
  private currentGameId: string | null = null;

  // Event handlers
  private gameStateUpdateHandlers: ((state: GameState) => void)[] = [];
  private playerJoinedHandlers: ((player: Player) => void)[] = [];
  private errorHandlers: ((error: GameError) => void)[] = [];

  constructor(socketUrl: string = `http://${window.location.hostname}:8887`) {
    this.socketClient = new SocketClient(socketUrl);
    this.setupMessageHandlers();
  }

  async connect(): Promise<void> {
    await this.socketClient.connect();
  }

  disconnect(): void {
    if (this.currentGameId) {
      this.socketClient.leaveRoom(this.currentGameId);
    }
    this.socketClient.disconnect();
    this.currentPlayer = null;
    this.gameState = null;
    this.currentGameId = null;
  }

  // Game Management
  async createGame(config: GameConfig): Promise<{ gameId: string }> {
    return new Promise((resolve, reject) => {
      const messageHandler = (message: SocketMessage) => {
        if (message.type === 'GAME_CREATED') {
          this.currentGameId = message.payload.gameId;
          if (this.currentGameId) {
            this.socketClient.joinRoom(this.currentGameId);
          }
          resolve(message.payload);
        } else if (message.type === 'ERROR') {
          reject(new Error(message.payload.message));
        }
      };

      this.socketClient.onMessage(messageHandler);
      this.socketClient.send({
        type: 'CREATE_GAME',
        payload: config
      }, { acknowledgment: true });
    });
  }

  async joinGame(gameCode: string, playerName: string): Promise<void> {
    this.currentGameId = gameCode;
    this.socketClient.joinRoom(gameCode);
    
    this.socketClient.send({
      type: 'JOIN_GAME',
      payload: { gameCode, playerName }
    }, { acknowledgment: true });
  }

  async leaveGame(): Promise<void> {
    if (this.currentGameId) {
      this.socketClient.send({
        type: 'LEAVE_GAME',
        payload: {}
      });
      this.socketClient.leaveRoom(this.currentGameId);
      this.currentGameId = null;
    }
  }

  // Player Actions
  async move(direction: Direction): Promise<void> {
    this.validateActionPoints(1);

    const action = {
      type: 'PLAYER_ACTION',
      payload: {
        action: 'MOVE',
        direction
      }
    };

    if (this.socketClient.isConnected()) {
      this.socketClient.send(action);
    } else {
      this.actionQueue.push(action);
    }
  }

  async useAbility(abilityId: string, targetId?: string): Promise<void> {
    const ability = this.getPlayerAbility(abilityId);
    if (!ability) {
      throw new Error('Ability not available');
    }

    this.validateActionPoints(ability.cost);

    const action = {
      type: 'PLAYER_ACTION',
      payload: {
        action: 'USE_ABILITY',
        abilityId,
        targetId
      }
    };

    if (this.socketClient.isConnected()) {
      this.socketClient.send(action);
    } else {
      this.actionQueue.push(action);
    }
  }

  async setReady(ready: boolean): Promise<void> {
    this.socketClient.send({
      type: 'PLAYER_READY',
      payload: { ready }
    });
  }

  // Event Handlers
  onGameStateUpdate(handler: (state: GameState) => void): void {
    this.gameStateUpdateHandlers.push(handler);
  }

  onPlayerJoined(handler: (player: Player) => void): void {
    this.playerJoinedHandlers.push(handler);
  }

  onError(handler: (error: GameError) => void): void {
    this.errorHandlers.push(handler);
  }

  // State Management
  setCurrentPlayer(player: Player): void {
    this.currentPlayer = player;
  }

  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  // Private Methods
  private setupMessageHandlers(): void {
    this.socketClient.onMessage(this.handleMessage.bind(this));
    this.socketClient.onError((error) => {
      this.notifyErrorHandlers({
        code: 'CONNECTION_ERROR',
        message: error.message
      });
    });
    this.socketClient.onReconnect(() => {
      if (this.currentGameId) {
        this.socketClient.joinRoom(this.currentGameId);
      }
      this.processActionQueue();
    });
  }

  private handleMessage(message: SocketMessage): void {
    switch (message.type) {
      case 'GAME_STATE_UPDATE':
        this.gameState = message.payload;
        this.notifyGameStateUpdateHandlers(message.payload);
        break;

      case 'PLAYER_JOINED':
        this.notifyPlayerJoinedHandlers(message.payload);
        break;

      case 'PLAYER_UPDATE':
        if (message.payload.playerId === this.currentPlayer?.playerId) {
          this.currentPlayer = { ...this.currentPlayer, ...message.payload };
        }
        break;

      case 'ERROR':
        this.notifyErrorHandlers(message.payload);
        break;

      default:
        // Ignore unknown message types
        break;
    }
  }

  private validateActionPoints(cost: number): void {
    if (!this.currentPlayer) {
      throw new Error('No current player set');
    }

    if (this.currentPlayer.actionPoints < cost) {
      throw new Error('Not enough action points');
    }
  }

  private getPlayerAbility(abilityId: string): Ability | null {
    if (!this.currentPlayer) {
      return null;
    }

    return this.currentPlayer.abilities.find(ability => ability.id === abilityId) || null;
  }

  private processActionQueue(): void {
    while (this.actionQueue.length > 0 && this.socketClient.isConnected()) {
      const action = this.actionQueue.shift()!;
      this.socketClient.send(action);
    }
  }

  private notifyGameStateUpdateHandlers(state: GameState): void {
    this.gameStateUpdateHandlers.forEach(handler => {
      try {
        handler(state);
      } catch (error) {
        console.error('Error in game state update handler:', error);
      }
    });
  }

  private notifyPlayerJoinedHandlers(player: Player): void {
    this.playerJoinedHandlers.forEach(handler => {
      try {
        handler(player);
      } catch (error) {
        console.error('Error in player joined handler:', error);
      }
    });
  }

  private notifyErrorHandlers(error: GameError): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    });
  }
}