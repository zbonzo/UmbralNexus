import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface SimpleJoinGameFormProps {
  onJoin: (gameCode: string, playerName: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialGameCode?: string;
}

export const SimpleJoinGameForm: React.FC<SimpleJoinGameFormProps> = ({ 
  onJoin, 
  onCancel, 
  isLoading = false,
  initialGameCode = ''
}) => {
  const [gameCode, setGameCode] = useState(initialGameCode.toUpperCase());
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    // Validate game code format (6 characters, alphanumeric)
    const codeRegex = /^[A-Z0-9]{6}$/;
    const upperGameCode = gameCode.toUpperCase();
    
    if (!codeRegex.test(upperGameCode)) {
      setError('Game code must be 6 characters (letters and numbers only)');
      return;
    }

    onJoin(upperGameCode, playerName.trim());
  };

  const handleGameCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setGameCode(value);
    setError('');
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // Limit to 20 characters
    setPlayerName(value);
    setError('');
  };

  return (
    <Card className="w-full max-w-md mx-auto" style={{ backgroundColor: '#0f172a', borderColor: '#334155' }}>
      <CardHeader>
        <CardTitle className="text-2xl text-center text-umbral-orange">
          Join Game
        </CardTitle>
        <CardDescription className="text-center">
          Enter the 6-character game code to join an adventure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gameCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Game Code
            </label>
            <input
              id="gameCode"
              type="text"
              placeholder="ABC123"
              value={gameCode}
              onChange={handleGameCodeChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center text-lg font-mono tracking-wider uppercase"
              maxLength={6}
              autoComplete="off"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="playerName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter your display name"
              value={playerName}
              onChange={handlePlayerNameChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={20}
              disabled={isLoading}
            />
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
              disabled={isLoading || !gameCode.trim() || !playerName.trim()}
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};