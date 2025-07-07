import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface GameConfig {
  hostName: string;
  playerCap: number;
  difficulty: 'normal' | 'hard' | 'nightmare';
}

interface SimpleCreateGameFormProps {
  onCreate: (config: GameConfig) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultName?: string;
}

export const SimpleCreateGameForm: React.FC<SimpleCreateGameFormProps> = ({ 
  onCreate, 
  onCancel, 
  isLoading = false,
  defaultName = '' 
}) => {
  const [hostName, setHostName] = useState(defaultName);
  const [playerCap, setPlayerCap] = useState(4);
  const [difficulty, setDifficulty] = useState<'normal' | 'hard' | 'nightmare'>('normal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (playerCap < 1 || playerCap > 20) {
      setError('Player cap must be between 1 and 20');
      return;
    }

    const config: GameConfig = {
      hostName: hostName.trim(),
      playerCap,
      difficulty,
    };

    onCreate(config);
  };

  const handleHostNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20);
    setHostName(value);
    setError('');
  };

  const getDifficultyDescription = () => {
    switch (difficulty) {
      case 'normal':
        return 'Balanced experience for new players';
      case 'hard':
        return 'Challenging gameplay for experienced parties';
      case 'nightmare':
        return 'Brutal difficulty for veteran adventurers';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto" style={{ backgroundColor: '#0f172a', borderColor: '#334155' }}>
      <CardHeader>
        <CardTitle className="text-2xl text-center text-umbral-orange">
          Create New Game
        </CardTitle>
        <CardDescription className="text-center">
          Configure your cooperative dungeon adventure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="hostName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Host Name</label>
            <input
              id="hostName"
              type="text"
              placeholder="Enter your display name"
              value={hostName}
              onChange={handleHostNameChange}
              maxLength={20}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="playerCap" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Player Limit</label>
            <select
              id="playerCap"
              value={playerCap}
              onChange={(e) => setPlayerCap(parseInt(e.target.value))}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Player' : 'Players'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'normal' | 'hard' | 'nightmare')}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="nightmare">Nightmare</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {getDifficultyDescription()}
            </p>
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !hostName.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};