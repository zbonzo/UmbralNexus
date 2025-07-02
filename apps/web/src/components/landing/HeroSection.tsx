import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface HeroSectionProps {
  onCreateGame: () => void;
  onJoinGame: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCreateGame, onJoinGame }) => {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-6xl md:text-7xl font-bold text-umbral-orange mb-6 glow-text animate-pulse-slow">
        Umbral Nexus
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        The ultimate cooperative roguelike experience for <span className="text-umbral-orange font-semibold">1-20 players</span>
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="glow-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">🎮 Host a Game</CardTitle>
            <CardDescription>
              Create a new dungeon adventure for your party
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onCreateGame}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Create New Game
            </Button>
          </CardContent>
        </Card>

        <Card className="glow-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">📱 Join a Game</CardTitle>
            <CardDescription>
              Enter a game code to join an existing adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onJoinGame}
              variant="outline"
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Join Existing Game
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>🌐 No downloads required</span>
          <span>📱 Use your phone as controller</span>
          <span>🖥️ Cast to any screen</span>
        </div>
        <p>Perfect for parties, game nights, and streaming</p>
      </div>
    </div>
  );
};