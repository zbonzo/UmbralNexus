import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type Screen = 'landing' | 'lobby' | 'game' | 'victory' | 'defeat';
type Theme = 'dark' | 'light';

interface UIStore {
  // Navigation
  currentScreen: Screen;
  previousScreen: Screen | null;
  
  // Connection Status
  isConnected: boolean;
  isReconnecting: boolean;
  
  // Modal and Dialog State
  showCreateGame: boolean;
  showJoinGame: boolean;
  showSettings: boolean;
  showCombatLog: boolean;
  showCharacterSelect: boolean;
  
  // Game UI State
  selectedTargets: string[];
  showTargeting: boolean;
  combatLogMessages: CombatLogMessage[];
  notifications: Notification[];
  
  // Accessibility
  theme: Theme;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Actions
  navigateToScreen: (screen: Screen) => void;
  goBack: () => void;
  setConnectionStatus: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
  
  // Modal Actions
  openCreateGame: () => void;
  closeCreateGame: () => void;
  openJoinGame: () => void;
  closeJoinGame: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleCombatLog: () => void;
  openCharacterSelect: () => void;
  closeCharacterSelect: () => void;
  
  // Game UI Actions
  addSelectedTarget: (targetId: string) => void;
  removeSelectedTarget: (targetId: string) => void;
  clearSelectedTargets: () => void;
  setShowTargeting: (show: boolean) => void;
  addCombatLogMessage: (message: CombatLogMessage) => void;
  clearCombatLog: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  
  // Accessibility Actions
  setTheme: (theme: Theme) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
}

interface CombatLogMessage {
  id: string;
  timestamp: number;
  type: 'damage' | 'heal' | 'ability' | 'move' | 'system';
  playerId?: string;
  playerName?: string;
  message: string;
  details?: any;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // Auto-dismiss after this many ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentScreen: 'landing',
      previousScreen: null,
      
      // Connection Status
      isConnected: false,
      isReconnecting: false,
      
      // Modal State
      showCreateGame: false,
      showJoinGame: false,
      showSettings: false,
      showCombatLog: false,
      showCharacterSelect: false,
      
      // Game UI State
      selectedTargets: [],
      showTargeting: false,
      combatLogMessages: [],
      notifications: [],
      
      // Accessibility
      theme: 'dark',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false,
      
      // Actions
      navigateToScreen: (screen) => {
        set({ 
          previousScreen: get().currentScreen,
          currentScreen: screen 
        });
      },

      goBack: () => {
        const { previousScreen } = get();
        if (previousScreen) {
          set({ 
            currentScreen: previousScreen,
            previousScreen: null 
          });
        }
      },

      setConnectionStatus: (connected) => {
        set({ isConnected: connected });
        if (connected) {
          set({ isReconnecting: false });
        }
      },

      setReconnecting: (reconnecting) => set({ isReconnecting: reconnecting }),

      // Modal Actions
      openCreateGame: () => set({ showCreateGame: true }),
      closeCreateGame: () => set({ showCreateGame: false }),
      openJoinGame: () => set({ showJoinGame: true }),
      closeJoinGame: () => set({ showJoinGame: false }),
      openSettings: () => set({ showSettings: true }),
      closeSettings: () => set({ showSettings: false }),
      toggleCombatLog: () => set({ showCombatLog: !get().showCombatLog }),
      openCharacterSelect: () => set({ showCharacterSelect: true }),
      closeCharacterSelect: () => set({ showCharacterSelect: false }),

      // Game UI Actions
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

      setShowTargeting: (show) => set({ showTargeting: show }),

      addCombatLogMessage: (message) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newMessage: CombatLogMessage = {
          ...message,
          id,
          timestamp: Date.now()
        };
        
        const messages = [...get().combatLogMessages, newMessage];
        // Keep only last 100 messages
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100);
        }
        
        set({ combatLogMessages: messages });
      },

      clearCombatLog: () => set({ combatLogMessages: [] }),

      addNotification: (notification) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now()
        };
        
        set({ 
          notifications: [...get().notifications, newNotification] 
        });

        // Auto-dismiss if duration is specified
        if (notification.duration) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
      },

      removeNotification: (id) => {
        set({ 
          notifications: get().notifications.filter(n => n.id !== id) 
        });
      },

      // Accessibility Actions
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
      },

      setFontSize: (size) => {
        set({ fontSize: size });
        // Apply font size to document
        document.documentElement.setAttribute('data-font-size', size);
      },

      setReducedMotion: (reduced) => {
        set({ reducedMotion: reduced });
        // Apply reduced motion preference
        document.documentElement.setAttribute('data-reduced-motion', reduced.toString());
      },

      setHighContrast: (enabled) => {
        set({ highContrast: enabled });
        // Apply high contrast mode
        document.documentElement.setAttribute('data-high-contrast', enabled.toString());
      }
    }),
    {
      name: 'ui-store',
    }
  )
);

export type { CombatLogMessage, Notification };