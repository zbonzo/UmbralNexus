import React, { useState } from 'react';
import { gameFlowManager } from '../services/gameFlowManager';

// Random name generator
const randomNames = [
  'Dragon', 'Phoenix', 'Griffin', 'Wizard', 'Knight', 'Ranger', 'Paladin', 'Rogue',
  'Mage', 'Warrior', 'Hunter', 'Cleric', 'Bard', 'Druid', 'Monk', 'Sorcerer',
  'Barbarian', 'Necromancer', 'Alchemist', 'Templar'
];

const generateRandomName = () => {
  const name = randomNames[Math.floor(Math.random() * randomNames.length)];
  const number = Math.floor(Math.random() * 100);
  return `${name}${number}`;
};

export const LandingPage: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCodeHelp, setShowCodeHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playerCap, setPlayerCap] = useState(8);
  const [difficulty, setDifficulty] = useState<'normal' | 'hard' | 'nightmare'>('normal');

  const isJoinMode = gameCode.length > 0;
  const nameLength = playerName.length;
  const isNameValid = playerName.trim().length > 0;

  const handleCreateGame = async () => {
    setError('');
    
    if (!isNameValid) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isJoinMode) {
        // Join existing game
        if (!gameCode.trim() || gameCode.length !== 6) {
          setError('Please enter a valid 6-character game code');
          setIsLoading(false);
          return;
        }
        await gameFlowManager.joinGame(gameCode.toUpperCase(), playerName);
      } else {
        // Create new game with selected settings
        await gameFlowManager.createGame({
          hostName: playerName,
          playerCap: playerCap,
          difficulty: difficulty
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomName = () => {
    setPlayerName(generateRandomName());
    setError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow letters, numbers, spaces, hyphens, apostrophes
    const validName = value.replace(/[^a-zA-Z0-9\s\-']/g, '');
    setPlayerName(validName);
    setError('');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setGameCode(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Join Card */}
          <div className="join-card bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-border/50 p-8">
            {/* Logo and Tagline */}
            <h1 className="text-4xl font-bold text-center text-umbral-orange mb-2">
              Umbral Nexus
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Battle dungeon monsters with friends in this cooperative roguelike!
            </p>

            {/* Name Input Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={handleNameChange}
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 h-10 px-3 py-2 text-sm bg-background rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  title="Generate a random name"
                  className="dice-button h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center text-lg"
                  disabled={isLoading}
                >
                  ⚄
                </button>
                <div className="h-10 px-3 flex items-center text-sm text-muted-foreground">
                  {nameLength}/20
                </div>
              </div>
              {error && !isJoinMode && (
                <div className="text-sm text-destructive mt-1">{error}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Allowed: Letters, numbers, spaces, hyphens (-), apostrophes (')
              </div>
            </div>

            {/* Game Settings (only shown when creating) */}
            {!isJoinMode && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center justify-center gap-1"
                >
                  <span>Game Settings</span>
                  <span className={`transition-transform ${showSettings ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {showSettings && (
                  <div className="space-y-4 p-4 bg-muted/20 rounded-md border border-border/50 mb-4">
                    {/* Player Count */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Players: {playerCap}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={playerCap}
                        onChange={(e) => setPlayerCap(parseInt(e.target.value))}
                        className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>20</span>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Difficulty
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setDifficulty('normal')}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            difficulty === 'normal'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setDifficulty('hard')}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            difficulty === 'hard'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          Hard
                        </button>
                        <button
                          type="button"
                          onClick={() => setDifficulty('nightmare')}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            difficulty === 'nightmare'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          Nightmare
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {difficulty === 'normal' && 'Balanced experience for new players'}
                        {difficulty === 'hard' && 'Challenging gameplay for experienced parties'}
                        {difficulty === 'nightmare' && 'Brutal difficulty for veteran adventurers'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Game Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateGame}
                disabled={!isNameValid || isLoading}
                className={`w-full h-12 rounded-md font-semibold text-base transition-all ${
                  !isNameValid || isLoading
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : isJoinMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isLoading ? 'Loading...' : isJoinMode ? 'Join Game' : 'Create New Game'}
              </button>
            </div>

            {/* Join Game Section */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Game Code
                </label>
                <button
                  type="button"
                  onClick={() => setShowCodeHelp(!showCodeHelp)}
                  className="h-6 w-6 rounded-full border border-input hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center text-xs"
                >
                  ?
                </button>
              </div>
              <input
                type="text"
                placeholder="6-character game code"
                value={gameCode}
                onChange={handleCodeChange}
                className="w-full h-10 px-3 py-2 text-sm bg-background rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono uppercase text-center tracking-wider"
                disabled={isLoading}
              />
              {error && isJoinMode && (
                <div className="text-sm text-destructive mt-1">{error}</div>
              )}
              {showCodeHelp && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-md">
                  Enter the 6-character code shown on the host's screen to join their game.
                </div>
              )}
            </div>

            {/* Tutorial Link */}
            <div className="mt-6 text-center">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How to Play
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4 mb-2">
          <button className="flex items-center gap-2 px-3 py-1 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors">
            <span>☀️</span>
            <span>Light</span>
            <span className="text-xs">▼</span>
          </button>
        </div>
        © 2025 Umbral Nexus • Play with 5+ friends for best experience
      </div>

    </div>
  );
};