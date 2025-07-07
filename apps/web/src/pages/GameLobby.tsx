import React from 'react';
import { useGameFlowStore } from '../stores/gameFlowStore';
import { gameFlowManager } from '../services/gameFlowManager';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const GameLobby: React.FC = () => {
  const { 
    gameId, 
    players, 
    maxPlayers, 
    isHost,
    currentPlayerId,
    gameConfig
  } = useGameFlowStore();

  const handleStartGame = () => {
    gameFlowManager.startGame();
  };

  const handleLeaveLobby = () => {
    gameFlowManager.leaveGame();
  };

  const handleChangeClass = () => {
    gameFlowManager.startCharacterSelection();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-umbral-orange">Game Lobby</h1>
            <p className="text-muted-foreground">Game ID: {gameId || 'Loading...'}</p>
          </div>
          <Button variant="outline" onClick={handleLeaveLobby}>
            Leave Lobby
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>Players ({players.length}/{maxPlayers || 4})</CardTitle>
              <CardDescription>
                {players.length < (maxPlayers || 4) 
                  ? "Waiting for more players to join..." 
                  : "All players ready!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Active players */}
                {players.map((player) => (
                  <div key={player.playerId} className="flex items-center justify-between p-3 bg-umbral-card/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-umbral-orange rounded-full flex items-center justify-center text-sm font-bold">
                        {player.playerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{player.playerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.selectedClass === 'warrior' && '⚔️ Warrior'}
                          {player.selectedClass === 'ranger' && '🏹 Ranger'}
                          {player.selectedClass === 'mage' && '🔮 Mage'}
                          {player.selectedClass === 'cleric' && '✨ Cleric'}
                          {!player.selectedClass && 'No class selected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.playerId === currentPlayerId && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleChangeClass}
                        >
                          {player.selectedClass ? 'Change Class' : 'Select Class'}
                        </Button>
                      )}
                      {player.isHost && (
                        <span className="text-xs bg-umbral-orange/20 text-umbral-orange px-2 py-1 rounded">
                          HOST
                        </span>
                      )}
                      {player.isReady && (
                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                          READY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: (maxPlayers || 4) - players.length }, (_, index) => (
                  <div key={`empty-${index}`} className="flex items-center gap-3 p-3 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <div className="w-8 h-8 bg-muted-foreground/10 rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{players.length + index + 1}</span>
                    </div>
                    <p className="text-muted-foreground">Waiting for player...</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>
                Configuration for this game session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium capitalize">{gameConfig?.difficulty || 'Normal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Player Limit:</span>
                <span className="font-medium">{maxPlayers} Players</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Victory Condition:</span>
                <span className="font-medium">Defeat Boss</span>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Share Game</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={gameId || 'Loading...'}
                      readOnly
                      className="flex-1 h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono tracking-wider text-center uppercase"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (gameId) {
                          navigator.clipboard.writeText(gameId);
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Share this code with other players
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              if (gameId) {
                window.open(`/cast/${gameId}`, '_blank');
              }
            }}
            disabled={!gameId}
          >
            Open Cast Screen
          </Button>
          <Button 
            size="lg" 
            onClick={handleStartGame}
            disabled={!isHost || players.length < 1}
          >
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
};