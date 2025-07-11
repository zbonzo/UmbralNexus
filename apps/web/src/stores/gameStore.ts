import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ApiClient } from '../services/apiClient';
import type { GameState, Player, GameError, GameConfig } from '@umbral-nexus/shared';

interface GameStore {
  // State
  apiClient: ApiClient | null;
  gameId: string | null;
  gameState: GameState | null;
  players: Map<string, Player>;
  currentFloor: number;
  isConnected: boolean;
  connectionError: GameError | null;
  isJoining: boolean;
  isCreating: boolean;

  // Actions
  initializeClient: () => void;
  setGameId: (id: string) => void;
  updateGameState: (state: GameState) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  setConnectionError: (error: GameError | null) => void;
  
  // Game Actions
  createGame: (config: GameConfig) => Promise<string>;
  joinGame: (gameCode: string, playerName: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  disconnect: () => void;

  // Computed
  activePlayerCount: number;
  isHost: boolean;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      apiClient: null,
      gameId: null,
      gameState: null,
      players: new Map(),
      currentFloor: 1,
      isConnected: false,
      connectionError: null,
      isJoining: false,
      isCreating: false,

      // Actions
      initializeClient: () => {
        const client = new ApiClient();
        set({ apiClient: client });
      },

      setGameId: (id) => set({ gameId: id }),

      updateGameState: (state) => {
        const playersMap = new Map<string, Player>();
        state.players.forEach(player => {
          playersMap.set(player.playerId, player);
        });

        set({ 
          gameState: state,
          players: playersMap,
          currentFloor: state.currentFloor,
          gameId: state.gameId
        });
      },

      addPlayer: (player) => {
        const players = new Map(get().players);
        players.set(player.playerId, player);
        set({ players });
      },

      removePlayer: (playerId) => {
        const players = new Map(get().players);
        players.delete(playerId);
        set({ players });
      },

      setConnectionStatus: (connected) => {
        set({ isConnected: connected });
        if (connected) {
          set({ connectionError: null });
        }
      },

      setConnectionError: (error) => set({ connectionError: error }),

      // Game Actions
      createGame: async (_config) => {
        const { apiClient } = get();
        if (!apiClient) {
          throw new Error('Game client not initialized');
        }

        set({ isCreating: true, connectionError: null });

        try {
          // TODO: Implement game creation with proper request format
          set({ isConnected: true, isCreating: false });
          return 'GAME123'; // Mock game ID
        } catch (error) {
          const gameError: GameError = {
            code: 'CREATE_GAME_FAILED',
            message: error instanceof Error ? error.message : 'Failed to create game'
          };
          set({ connectionError: gameError, isCreating: false });
          throw error;
        }
      },

      joinGame: async (gameCode, _playerName) => {
        const { apiClient } = get();
        if (!apiClient) {
          throw new Error('Game client not initialized');
        }

        set({ isJoining: true, connectionError: null });

        try {
          // TODO: Implement game joining with proper request format
          set({ isConnected: true, gameId: gameCode, isJoining: false });
        } catch (error) {
          const gameError: GameError = {
            code: 'JOIN_GAME_FAILED',
            message: error instanceof Error ? error.message : 'Failed to join game'
          };
          set({ connectionError: gameError, isJoining: false });
          throw error;
        }
      },

      leaveGame: async () => {
        const { apiClient } = get();
        if (!apiClient) return;

        try {
          // TODO: Implement game leaving
          set({ 
            gameId: null, 
            gameState: null, 
            players: new Map(), 
            currentFloor: 1 
          });
        } catch (error) {
          console.error('Error leaving game:', error);
        }
      },

      disconnect: () => {
        // TODO: Implement disconnect
        
        set({ 
          isConnected: false,
          gameId: null,
          gameState: null,
          players: new Map(),
          currentFloor: 1,
          connectionError: null
        });
      },

      // Computed values
      get activePlayerCount() {
        return get().players.size;
      },

      get isHost() {
        const { gameState } = get();
        // TODO: Implement host detection logic based on game state
        return gameState?.players?.[0]?.playerId === 'current-player-id';
      }
    }),
    {
      name: 'game-store',
    }
  )
);