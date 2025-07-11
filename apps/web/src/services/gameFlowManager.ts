import { ApiClient } from './apiClient';
import { RealTimeClient } from './realTimeClient';
import { useGameFlowStore, PlayerReadyState } from '../stores/gameFlowStore';
import type { GameState } from '@umbral-nexus/shared';

class GameFlowManager {
  private apiClient: ApiClient;
  private realTimeClient: RealTimeClient;
  private store = useGameFlowStore.getState;
  private unsubscribe?: () => void;
  private currentGameId: string | null = null;
  private currentPlayerId: string | null = null;

  constructor() {
    this.apiClient = new ApiClient();
    this.realTimeClient = new RealTimeClient();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Listen to real-time client events
    this.realTimeClient.on('game-state', this.handleGameStateUpdate.bind(this));
    this.realTimeClient.on('player-joined', this.handlePlayerJoined.bind(this));
    this.realTimeClient.on('player-left', this.handlePlayerLeft.bind(this));
    this.realTimeClient.on('error', this.handleGameError.bind(this));
    this.realTimeClient.on('connection-acknowledged', this.handleConnectionAcknowledged.bind(this));
    this.realTimeClient.on('game-started', this.handleGameStarted.bind(this));
    this.realTimeClient.on('player-position', this.handlePlayerPositionUpdate.bind(this));

    // Subscribe to store changes to trigger side effects
    let previousPhase: string | null = null;
    this.unsubscribe = useGameFlowStore.subscribe(
      (state) => {
        if (previousPhase !== state.currentPhase) {
          this.handlePhaseChange(state.currentPhase, previousPhase || '');
          previousPhase = state.currentPhase;
        }
      }
    );
  }

  private async handlePhaseChange(phase: string, previousPhase: string) {
    console.log(`Phase transition: ${previousPhase} → ${phase}`);
    
    switch (phase) {
      case 'creating':
        await this.handleGameCreation();
        break;
      case 'joining':
        await this.handleGameJoining();
        break;
      case 'character-select':
        this.handleCharacterSelectionStart();
        break;
      case 'loading-game':
        await this.handleGameStart();
        break;
    }
  }

  // Public methods for UI to call
  async createGame(config: { hostName: string; playerCap: number; difficulty: string }) {
    const store = this.store();
    store.startGameCreation(config);
    
    try {
      // Connect to real-time server
      await this.realTimeClient.connect();
      
      // Generate unique player ID
      const hostId = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentPlayerId = hostId;
      
      // Create game via API
      const gameInfo = await this.apiClient.createGame({
        name: `${config.hostName}'s Game`,
        hostId,
        hostName: config.hostName,
        playerCap: config.playerCap,
        difficulty: config.difficulty as 'normal' | 'hard' | 'nightmare',
        endConditions: {
          type: 'TIME_LIMIT',
          value: 3600, // 1 hour default
        },
      });
      
      this.currentGameId = gameInfo.gameId;
      
      // Join the game room via WebSocket
      await this.realTimeClient.joinGame(gameInfo.gameId, hostId, config.hostName);
      
      // Update store with game info
      store.joinedLobby({
        gameId: gameInfo.gameId,
        players: [{
          playerId: hostId,
          playerName: config.hostName,
          isReady: false,
          isHost: true
        }],
        maxPlayers: config.playerCap,
        isHost: true
      });
      
      // Set current player
      useGameFlowStore.setState({ 
        currentPlayerId: hostId,
        currentPlayerName: config.hostName 
      });
      
    } catch (error) {
      console.error('Error creating game:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to create game');
    }
  }

  async joinGame(gameId: string, playerName: string) {
    const store = this.store();
    store.startJoiningGame(gameId, playerName);
    
    try {
      // Connect to real-time server
      await this.realTimeClient.connect();
      
      // Generate unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentPlayerId = playerId;
      this.currentGameId = gameId;
      
      // Join game via API (with default warrior class for now)
      const gameInfo = await this.apiClient.joinGame({
        gameId,
        playerId,
        name: playerName,
        class: 'warrior', // Default for now, can be changed in character selection
      });
      
      // Join the game room via WebSocket
      await this.realTimeClient.joinGame(gameId, playerId, playerName);
      
      // Convert API response to store format
      const players: PlayerReadyState[] = gameInfo.players.map(player => ({
        playerId: player.playerId,
        playerName: player.name,
        isReady: false, // Will be managed separately
        isHost: player.playerId === gameInfo.host,
        selectedClass: player.class,
      }));
      
      store.joinedLobby({
        gameId: gameInfo.gameId,
        players,
        maxPlayers: gameInfo.config.playerCap,
        isHost: playerId === gameInfo.host
      });
      
      useGameFlowStore.setState({ 
        currentPlayerId: playerId,
        currentPlayerName: playerName 
      });
      
    } catch (error) {
      console.error('Error joining game:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to join game');
    }
  }

  startCharacterSelection() {
    this.store().startCharacterSelection();
  }

  selectCharacterClass(classId: string) {
    this.store().selectClass(classId);
  }

  async confirmCharacterSelection() {
    const state = this.store();
    if (!state.selectedClass) return;
    
    state.confirmCharacterSelection();
    
    try {
      // TODO: Send character selection to server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      // Update the player's selected class in the players list
      const updatedPlayers = state.players.map(player => 
        player.playerId === state.currentPlayerId 
          ? { ...player, selectedClass: state.selectedClass || undefined }
          : player
      );
      
      // Navigate back to lobby with class selected
      useGameFlowStore.setState({ 
        currentPhase: 'lobby',
        isLoading: false,
        players: updatedPlayers
      });
      
    } catch (error) {
      state.setError('Failed to confirm character selection');
    }
  }

  async startGame() {
    const store = this.store();
    store.startGame();
    
    try {
      // Mock game loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      useGameFlowStore.setState({ 
        currentPhase: 'in-game',
        isLoading: false 
      });
      
    } catch (error) {
      store.setError('Failed to start game');
    }
  }

  async leaveGame() {
    if (this.currentGameId && this.currentPlayerId) {
      try {
        await this.apiClient.leaveGame(this.currentGameId, this.currentPlayerId);
        await this.realTimeClient.leaveGame();
      } catch (error) {
        console.error('Error leaving game:', error);
      }
    }
    
    this.realTimeClient.disconnect();
    this.currentGameId = null;
    this.currentPlayerId = null;
    this.store().returnToLanding();
  }


  // Private handlers
  private async handleGameCreation() {
    // Additional logic when creating game
  }

  private async handleGameJoining() {
    // Additional logic when joining game  
  }

  private handleCharacterSelectionStart() {
    // Character selection specific setup
  }

  private async handleGameStart() {
    // Game start specific setup
  }

  private handleGameStateUpdate(gameState: GameState) {
    console.log('Game state updated:', gameState);
    
    // Convert game state to our flow format
    const players: PlayerReadyState[] = gameState.players.map(player => ({
      playerId: player.playerId,
      playerName: player.name,
      isReady: true, // Mock ready state
      selectedClass: player.class,
      isHost: false // Would be determined by game logic
    }));
    
    useGameFlowStore.setState({ players });
  }

  private handlePlayerJoined(data: { playerId: string; playerName: string; timestamp: string }) {
    console.log('Player joined:', data);
    
    const playerState: PlayerReadyState = {
      playerId: data.playerId,
      playerName: data.playerName,
      isReady: false,
      isHost: false
    };
    
    this.store().addPlayer(playerState);
  }

  private handlePlayerLeft(data: { playerId: string; timestamp: string }) {
    console.log('Player left:', data);
    
    // Remove player from store
    const currentState = this.store();
    const updatedPlayers = currentState.players.filter(p => p.playerId !== data.playerId);
    
    useGameFlowStore.setState({ players: updatedPlayers });
  }

  private handleConnectionAcknowledged(data: { playerId: string; gameId: string; timestamp: string }) {
    console.log('Connection acknowledged:', data);
    // Connection successful - any additional setup can go here
  }

  private handleGameStarted(data: { gameId: string; startTime: number; timestamp: string }) {
    console.log('Game started:', data);
    useGameFlowStore.setState({ 
      currentPhase: 'in-game',
      isLoading: false 
    });
  }

  private handleGameError(error: { message: string; details?: any }) {
    console.error('Game error:', error);
    this.store().setError(error.message || 'An unexpected error occurred');
  }

  private handlePlayerPositionUpdate(data: { playerId: string; position: { floor: number; x: number; y: number }; actionPoints?: number }) {
    console.log('Player position update:', data);
    
    // Update the specific player's position in the game state
    const currentState = this.store();
    const updatedPlayers = currentState.players.map(player => {
      if (player.playerId === data.playerId) {
        return {
          ...player,
          position: data.position,
          actionPoints: data.actionPoints !== undefined ? data.actionPoints : player.actionPoints
        };
      }
      return player;
    });
    
    useGameFlowStore.setState({ players: updatedPlayers });
  }

  // Helper methods

  // Public method to send player actions
  sendPlayerAction(action: { type: 'MOVE_TO'; targetPosition: { x: number; y: number } } | 
                          { type: 'SET_TARGET'; targetId: string | null; targetType: 'player' | 'enemy' } |
                          { type: 'USE_ABILITY'; abilityId: string; targetId?: string; targetPosition?: { x: number; y: number } } |
                          { type: 'USE_ITEM'; itemId: string } |
                          { type: 'STOP_MOVING' }) {
    if (!this.realTimeClient.isConnected()) {
      throw new Error('Not connected to game server');
    }
    
    this.realTimeClient.sendPlayerAction(action);
  }

  // Cleanup
  destroy() {
    this.unsubscribe?.();
    this.realTimeClient.disconnect();
    this.currentGameId = null;
    this.currentPlayerId = null;
  }
}

// Create singleton instance
export const gameFlowManager = new GameFlowManager();