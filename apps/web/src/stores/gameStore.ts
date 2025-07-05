import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GameClient } from '../services/gameClient';
import type { GameState, Player, GameError, GameConfig } from '@umbral-nexus/shared';

interface GameStore {
  // State
  gameClient: GameClient | null;
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
      gameClient: null,
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
        const client = new GameClient();
        
        // Set up event handlers
        client.onGameStateUpdate((state) => {
          get().updateGameState(state);
        });

        client.onPlayerJoined((player) => {
          get().addPlayer(player);
        });

        client.onError((error) => {
          get().setConnectionError(error);
        });

        set({ gameClient: client });
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
      createGame: async (config) => {
        const { gameClient } = get();
        if (!gameClient) {
          throw new Error('Game client not initialized');
        }

        set({ isCreating: true, connectionError: null });

        try {
          await gameClient.connect();
          set({ isConnected: true });
          
          const result = await gameClient.createGame(config);
          set({ gameId: result.gameId, isCreating: false });
          
          return result.gameId;
        } catch (error) {
          const gameError: GameError = {
            code: 'CREATE_GAME_FAILED',
            message: error instanceof Error ? error.message : 'Failed to create game'
          };
          set({ connectionError: gameError, isCreating: false });
          throw error;
        }
      },

      joinGame: async (gameCode, playerName) => {
        const { gameClient } = get();
        if (!gameClient) {
          throw new Error('Game client not initialized');
        }

        set({ isJoining: true, connectionError: null });

        try {
          await gameClient.connect();
          set({ isConnected: true });
          
          await gameClient.joinGame(gameCode, playerName);
          set({ gameId: gameCode, isJoining: false });
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
        const { gameClient } = get();
        if (!gameClient) return;

        try {
          await gameClient.leaveGame();
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
        const { gameClient } = get();
        if (gameClient) {
          gameClient.disconnect();
        }
        
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