import React, { useEffect } from 'react';
import { useGameFlowStore } from './stores/gameFlowStore';
import { gameFlowManager } from './services/gameFlowManager';

// Import all the screens
import { LandingPage } from './pages/LandingPage';
import { GameLobby } from './pages/GameLobby';
import { CharacterSelection } from './pages/CharacterSelection';
import { GameController } from './pages/GameController';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';

export const App: React.FC = () => {
  const { 
    currentPhase, 
    isLoading, 
    loadingMessage, 
    error,
    setError,
    returnToLanding 
  } = useGameFlowStore();

  // Handle browser refresh/navigation - for now, just return to landing
  useEffect(() => {
    const handleBeforeUnload = () => {
      gameFlowManager.leaveGame();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle error retry
  const handleRetry = () => {
    setError(null);
    // Optionally restart the current operation
  };

  const handleGoBack = () => {
    returnToLanding();
  };

  // Show loading overlay if needed
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  // Show error screen if needed
  if (error) {
    return (
      <ErrorScreen 
        error={error}
        onRetry={handleRetry}
        onGoBack={handleGoBack}
      />
    );
  }

  // Render appropriate screen based on game phase
  switch (currentPhase) {
    case 'landing':
      return <LandingPage />;
      
    case 'lobby':
      return <GameLobby />;
      
    case 'character-select':
      return <CharacterSelection />;
      
    case 'in-game':
      return <GameController />;
      
    case 'game-over':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Game Over</h1>
            <button
              onClick={returnToLanding}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Return to Menu
            </button>
          </div>
        </div>
      );
      
    default:
      // Fallback to landing page for unknown phases
      return <LandingPage />;
  }
};