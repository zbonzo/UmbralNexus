import { GameClient } from './gameClient';
import { useGameFlowStore, PlayerReadyState } from '../stores/gameFlowStore';
import type { GameConfig, Player, GameState } from '@umbral-nexus/shared';

class GameFlowManager {
  private gameClient: GameClient;
  private store = useGameFlowStore.getState;
  private unsubscribe?: () => void;

  constructor() {
    this.gameClient = new GameClient();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Listen to game client events
    this.gameClient.onGameStateUpdate(this.handleGameStateUpdate.bind(this));
    this.gameClient.onPlayerJoined(this.handlePlayerJoined.bind(this));
    this.gameClient.onError(this.handleGameError.bind(this));

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
      // Skip backend connection for now - use mock mode
      console.log('Creating game in mock mode...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock game ID
      const gameId = this.generateGameId();
      
      // Mock some initial lobby data
      store.joinedLobby({
        gameId,
        players: [{
          playerId: 'host-player-id',
          playerName: config.hostName,
          isReady: false,
          isHost: true
        }],
        maxPlayers: config.playerCap,
        isHost: true
      });
      
      // Set current player
      useGameFlowStore.setState({ 
        currentPlayerId: 'host-player-id',
        currentPlayerName: config.hostName 
      });
      
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create game');
    }
  }

  async joinGame(gameId: string, playerName: string) {
    const store = this.store();
    store.startJoiningGame(gameId, playerName);
    
    try {
      // Skip backend connection for now - use mock mode
      console.log('Joining game in mock mode...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock joining an existing lobby
      const mockPlayerId = `player-${Date.now()}`;
      store.joinedLobby({
        gameId,
        players: [
          {
            playerId: 'host-player-id',
            playerName: 'Host Player',
            isReady: false,
            isHost: true
          },
          {
            playerId: mockPlayerId,
            playerName,
            isReady: false,
            isHost: false
          }
        ],
        maxPlayers: 4,
        isHost: false
      });
      
      useGameFlowStore.setState({ 
        currentPlayerId: mockPlayerId,
        currentPlayerName: playerName 
      });
      
    } catch (error) {
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
      
      // Navigate back to lobby with class selected
      useGameFlowStore.setState({ 
        currentPhase: 'lobby',
        isLoading: false 
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

  leaveGame() {
    this.gameClient.disconnect();
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

  private handlePlayerJoined(player: Player) {
    console.log('Player joined:', player);
    
    const playerState: PlayerReadyState = {
      playerId: player.playerId,
      playerName: player.name,
      isReady: false,
      selectedClass: player.class,
      isHost: false
    };
    
    this.store().addPlayer(playerState);
  }

  private handleGameError(error: any) {
    console.error('Game error:', error);
    this.store().setError(error.message || 'An unexpected error occurred');
  }

  // Helper methods
  private generateGameId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Cleanup
  destroy() {
    this.unsubscribe?.();
    this.gameClient.disconnect();
  }
}

// Create singleton instance
export const gameFlowManager = new GameFlowManager();