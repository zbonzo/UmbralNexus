import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  showSpinner?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  progress,
  showSpinner = true 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
      
      <div className="relative z-10 text-center">
        {/* Spinner */}
        {showSpinner && (
          <div className="mb-8">
            <div className="relative w-16 h-16 mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 border-4 border-slate-600 rounded-full"></div>
              {/* Spinning ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
              {/* Inner glow */}
              <div className="absolute inset-2 bg-blue-400/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        
        {/* Message */}
        <h2 className="text-2xl font-semibold text-white mb-4 animate-pulse">
          {message}
        </h2>
        
        {/* Progress Bar */}
        {typeof progress === 'number' && (
          <div className="w-80 max-w-md mx-auto">
            <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">{Math.round(progress)}%</p>
          </div>
        )}
        
        {/* Loading dots animation */}
        <div className="flex justify-center items-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const GameLoadingScreen: React.FC<{ phase: string }> = ({ phase }) => {
  const getMessageForPhase = (phase: string) => {
    switch (phase) {
      case 'creating': return 'Creating your game session...';
      case 'joining': return 'Joining the adventure...';
      case 'loading-game': return 'Entering the dungeon...';
      case 'character-select': return 'Preparing character selection...';
      default: return 'Loading...';
    }
  };

  return <LoadingScreen message={getMessageForPhase(phase)} />;
};