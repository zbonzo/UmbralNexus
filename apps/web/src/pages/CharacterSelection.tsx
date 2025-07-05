import React from 'react';
import { useGameFlowStore } from '../stores/gameFlowStore';
import { gameFlowManager } from '../services/gameFlowManager';
import { CharacterSelect } from '../components/CharacterSelect';
import { Button } from '../components/ui/button';

export const CharacterSelection: React.FC = () => {
  const { gameId, selectedClass, isLoading } = useGameFlowStore();

  const handleSelectClass = (classId: string) => {
    gameFlowManager.selectCharacterClass(classId);
  };

  const handleConfirmSelection = async () => {
    if (selectedClass) {
      await gameFlowManager.confirmCharacterSelection();
    }
  };

  const handleGoBack = () => {
    gameFlowManager.leaveGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
      
      <div className="relative z-10 min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Choose Your Path
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <p className="text-slate-400 font-medium">Game: {gameId || 'Loading...'}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              ← Back to Lobby
            </Button>
          </div>

          {/* Character Selection */}
          <div className="mb-12">
            <CharacterSelect 
              selectedClass={selectedClass || undefined}
              onSelectClass={handleSelectClass} 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleGoBack}
              className="w-full sm:w-auto bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              Cancel Selection
            </Button>
            
            <Button 
              size="lg" 
              onClick={handleConfirmSelection}
              disabled={!selectedClass || isLoading}
              className={`
                w-full sm:w-auto min-w-[200px] font-semibold transition-all duration-200
                ${selectedClass && !isLoading
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-600/25' 
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading 
                ? 'Confirming...'
                : selectedClass 
                  ? `Enter as ${selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)}` 
                  : 'Select a Class First'
              }
            </Button>
          </div>

          {/* Success Message */}
          {selectedClass && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 font-medium">
                  Ready to embark on your adventure as a {selectedClass}!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};