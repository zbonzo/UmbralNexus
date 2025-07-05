import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Player, Ability, CharacterClass } from '@umbral-nexus/shared';

interface PlayerStore {
  // State
  currentPlayer: Player | null;
  playerId: string | null;
  playerClass: CharacterClass | null;
  actionPoints: number;
  maxActionPoints: number;
  selectedAbility: Ability | null;
  selectedTargets: string[];
  isReady: boolean;
  
  // UI State
  showAbilities: boolean;
  showInventory: boolean;
  
  // Actions
  setCurrentPlayer: (player: Player) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  setPlayerClass: (playerClass: CharacterClass) => void;
  useActionPoints: (cost: number) => void;
  restoreActionPoints: (amount?: number) => void;
  selectAbility: (ability: Ability | null) => void;
  addSelectedTarget: (targetId: string) => void;
  removeSelectedTarget: (targetId: string) => void;
  clearSelectedTargets: () => void;
  setReady: (ready: boolean) => void;
  
  // UI Actions
  toggleAbilities: () => void;
  toggleInventory: () => void;
  
  // Computed
  canUseAbility: (ability: Ability) => boolean;
  hasEnoughAP: (cost: number) => boolean;
  availableAbilities: Ability[];
}

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentPlayer: null,
      playerId: null,
      playerClass: null,
      actionPoints: 3,
      maxActionPoints: 3,
      selectedAbility: null,
      selectedTargets: [],
      isReady: false,
      
      // UI State
      showAbilities: false,
      showInventory: false,
      
      // Actions
      setCurrentPlayer: (player) => {
        set({ 
          currentPlayer: player,
          playerId: player.playerId,
          playerClass: player.class,
          actionPoints: player.actionPoints,
        });
      },

      updatePlayer: (updates) => {
        const currentPlayer = get().currentPlayer;
        if (!currentPlayer) return;
        
        const updatedPlayer = { ...currentPlayer, ...updates };
        set({ 
          currentPlayer: updatedPlayer,
          actionPoints: updatedPlayer.actionPoints,
        });
      },

      setPlayerClass: (playerClass) => set({ playerClass }),

      useActionPoints: (cost) => {
        const { actionPoints } = get();
        if (actionPoints >= cost) {
          set({ actionPoints: actionPoints - cost });
          
          // Update current player if it exists
          const currentPlayer = get().currentPlayer;
          if (currentPlayer) {
            set({ 
              currentPlayer: { 
                ...currentPlayer, 
                actionPoints: actionPoints - cost 
              }
            });
          }
        }
      },

      restoreActionPoints: (amount) => {
        const { maxActionPoints } = get();
        const restoreAmount = amount ?? maxActionPoints;
        
        set({ actionPoints: Math.min(get().actionPoints + restoreAmount, maxActionPoints) });
        
        // Update current player if it exists
        const currentPlayer = get().currentPlayer;
        if (currentPlayer) {
          const newAP = Math.min(currentPlayer.actionPoints + restoreAmount, maxActionPoints);
          set({ 
            currentPlayer: { 
              ...currentPlayer, 
              actionPoints: newAP 
            }
          });
        }
      },

      selectAbility: (ability) => {
        set({ selectedAbility: ability });
        if (!ability) {
          get().clearSelectedTargets();
        }
      },

      addSelectedTarget: (targetId) => {
        const targets = get().selectedTargets;
        if (!targets.includes(targetId)) {
          set({ selectedTargets: [...targets, targetId] });
        }
      },

      removeSelectedTarget: (targetId) => {
        set({ 
          selectedTargets: get().selectedTargets.filter(id => id !== targetId) 
        });
      },

      clearSelectedTargets: () => set({ selectedTargets: [] }),

      setReady: (ready) => set({ isReady: ready }),

      // UI Actions
      toggleAbilities: () => set({ showAbilities: !get().showAbilities }),
      toggleInventory: () => set({ showInventory: !get().showInventory }),

      // Computed
      canUseAbility: (ability) => {
        const { actionPoints } = get();
        return actionPoints >= ability.cost && ability.cooldown === 0;
      },

      hasEnoughAP: (cost) => {
        return get().actionPoints >= cost;
      },

      get availableAbilities() {
        const { currentPlayer } = get();
        if (!currentPlayer) return [];
        
        return currentPlayer.abilities.filter((ability: Ability) => 
          get().canUseAbility(ability)
        );
      }
    }),
    {
      name: 'player-store',
    }
  )
);