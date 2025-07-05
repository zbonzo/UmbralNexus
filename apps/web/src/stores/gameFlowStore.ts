import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type GamePhase = 
  | 'landing'           // Landing page
  | 'creating'          // Creating game (loading)
  | 'joining'           // Joining game (loading)  
  | 'lobby'             // In lobby, waiting for players
  | 'character-select'  // Selecting character class
  | 'loading-game'      // Loading into game
  | 'in-game'           // Playing the game
  | 'game-over'         // Game completed
  | 'error';            // Error state

export type PlayerReadyState = {
  playerId: string;
  playerName: string;
  isReady: boolean;
  selectedClass?: string;
  isHost: boolean;
};

interface GameFlowState {
  // Current state
  currentPhase: GamePhase;
  gameId: string | null;
  isHost: boolean;
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Error handling
  error: string | null;
  
  // Game session data
  players: PlayerReadyState[];
  maxPlayers: number;
  gameConfig: {
    hostName: string;
    playerCap: number;
    difficulty: string;
  } | null;
  
  // Player state
  currentPlayerId: string | null;
  currentPlayerName: string | null;
  selectedClass: string | null;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  
  // Game flow actions
  startGameCreation: (config: { hostName: string; playerCap: number; difficulty: string }) => void;
  startJoiningGame: (gameId: string, playerName: string) => void;
  joinedLobby: (gameData: { gameId: string; players: PlayerReadyState[]; maxPlayers: number; isHost: boolean }) => void;
  startCharacterSelection: () => void;
  selectClass: (classId: string) => void;
  confirmCharacterSelection: () => void;
  startGame: () => void;
  endGame: (result: 'victory' | 'defeat') => void;
  returnToLanding: () => void;
  
  // Player updates
  updatePlayer: (playerId: string, updates: Partial<PlayerReadyState>) => void;
  addPlayer: (player: PlayerReadyState) => void;
  removePlayer: (playerId: string) => void;
  
  // Computed getters
  get canStartGame(): boolean;
  get isPlayerReady(): boolean;
  get readyPlayerCount(): number;
}

export const useGameFlowStore = create<GameFlowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentPhase: 'landing',
      gameId: null,
      isHost: false,
      isLoading: false,
      loadingMessage: '',
      error: null,
      players: [],
      maxPlayers: 4,
      gameConfig: null,
      currentPlayerId: null,
      currentPlayerName: null,
      selectedClass: null,

      // Basic actions
      setPhase: (phase) => set({ currentPhase: phase }),
      
      setLoading: (loading, message = '') => set({ 
        isLoading: loading, 
        loadingMessage: message,
        error: loading ? null : get().error // Clear error when starting to load
      }),
      
      setError: (error) => set({ 
        error, 
        isLoading: false,
        currentPhase: error ? 'error' : get().currentPhase
      }),

      // Game flow actions
      startGameCreation: (config) => {
        set({
          currentPhase: 'creating',
          isLoading: true,
          loadingMessage: 'Creating your game...',
          gameConfig: config,
          isHost: true,
          error: null
        });
      },

      startJoiningGame: (gameId, playerName) => {
        set({
          currentPhase: 'joining',
          isLoading: true,
          loadingMessage: `Joining game ${gameId}...`,
          gameId,
          currentPlayerName: playerName,
          isHost: false,
          error: null
        });
      },

      joinedLobby: (gameData) => {
        set({
          currentPhase: 'lobby',
          gameId: gameData.gameId,
          players: gameData.players,
          maxPlayers: gameData.maxPlayers,
          isHost: gameData.isHost,
          isLoading: false,
          loadingMessage: '',
          error: null
        });
      },

      startCharacterSelection: () => {
        set({
          currentPhase: 'character-select',
          isLoading: false,
          error: null
        });
      },

      selectClass: (classId) => {
        set({ selectedClass: classId });
      },

      confirmCharacterSelection: () => {
        const { selectedClass, currentPlayerId } = get();
        if (!selectedClass || !currentPlayerId) return;

        set({
          isLoading: true,
          loadingMessage: 'Confirming your class selection...'
        });
        
        // Update local player state
        get().updatePlayer(currentPlayerId, { 
          selectedClass,
          isReady: true 
        });
      },

      startGame: () => {
        set({
          currentPhase: 'loading-game',
          isLoading: true,
          loadingMessage: 'Loading into the dungeon...'
        });
      },

      endGame: (result) => {
        set({
          currentPhase: 'game-over',
          isLoading: false,
          loadingMessage: result === 'victory' ? 'Victory!' : 'Defeat...'
        });
      },

      returnToLanding: () => {
        set({
          currentPhase: 'landing',
          gameId: null,
          isHost: false,
          isLoading: false,
          loadingMessage: '',
          error: null,
          players: [],
          gameConfig: null,
          currentPlayerId: null,
          currentPlayerName: null,
          selectedClass: null
        });
      },

      // Player management
      updatePlayer: (playerId, updates) => {
        const players = get().players.map(player => 
          player.playerId === playerId 
            ? { ...player, ...updates }
            : player
        );
        set({ players });
      },

      addPlayer: (player) => {
        const players = [...get().players];
        const existingIndex = players.findIndex(p => p.playerId === player.playerId);
        
        if (existingIndex >= 0) {
          players[existingIndex] = player;
        } else {
          players.push(player);
        }
        
        set({ players });
      },

      removePlayer: (playerId) => {
        const players = get().players.filter(p => p.playerId !== playerId);
        set({ players });
      },

      // Computed getters
      get canStartGame() {
        const { players, isHost } = get();
        return isHost && players.length > 0 && players.every(p => p.isReady);
      },

      get isPlayerReady() {
        const { currentPlayerId, players } = get();
        const currentPlayer = players.find(p => p.playerId === currentPlayerId);
        return currentPlayer?.isReady || false;
      },

      get readyPlayerCount() {
        return get().players.filter(p => p.isReady).length;
      },
    }),
    {
      name: 'game-flow-store',
    }
  )
);