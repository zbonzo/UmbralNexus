import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const GameController: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [actionPoints, setActionPoints] = useState(3);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  const handleLeaveGame = () => {
    navigate('/');
  };

  const handleMove = (direction: string) => {
    if (actionPoints > 0) {
      console.log('Moving', direction);
      setActionPoints(prev => prev - 1);
    }
  };

  const handleUseAbility = (ability: string) => {
    if (actionPoints >= 1) {
      console.log('Using ability:', ability);
      setActionPoints(prev => prev - 1);
      setSelectedAbility(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-umbral-orange">Controller</h1>
            <p className="text-sm text-muted-foreground">Game: {gameId}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLeaveGame}>
            Leave
          </Button>
        </div>

        {/* Player Status */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">⚔️ Warrior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Health:</span>
              <span className="text-sm font-medium">120/120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Action Points:</span>
              <span className="text-sm font-medium text-umbral-orange">{actionPoints}/3</span>
            </div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: '100%' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Movement Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
              <div></div>
              <Button 
                variant="outline" 
                size="lg"
                className="aspect-square"
                onClick={() => handleMove('up')}
                disabled={actionPoints === 0}
              >
                ↑
              </Button>
              <div></div>
              <Button 
                variant="outline" 
                size="lg"
                className="aspect-square"
                onClick={() => handleMove('left')}
                disabled={actionPoints === 0}
              >
                ←
              </Button>
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                1 AP
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="aspect-square"
                onClick={() => handleMove('right')}
                disabled={actionPoints === 0}
              >
                →
              </Button>
              <div></div>
              <Button 
                variant="outline" 
                size="lg"
                className="aspect-square"
                onClick={() => handleMove('down')}
                disabled={actionPoints === 0}
              >
                ↓
              </Button>
              <div></div>
            </div>
          </CardContent>
        </Card>

        {/* Abilities */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Abilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant={selectedAbility === 'shield-bash' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleUseAbility('shield-bash')}
              disabled={actionPoints === 0}
            >
              <span className="mr-2">🛡️</span>
              Shield Bash (1 AP)
            </Button>
            <Button 
              variant={selectedAbility === 'rallying-cry' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleUseAbility('rallying-cry')}
              disabled={actionPoints < 2}
            >
              <span className="mr-2">📢</span>
              Rallying Cry (2 AP)
            </Button>
            <Button 
              variant={selectedAbility === 'whirlwind' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleUseAbility('whirlwind')}
              disabled={actionPoints < 3}
            >
              <span className="mr-2">🌪️</span>
              Whirlwind (3 AP)
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            💬 Emote
          </Button>
          <Button variant="outline" size="sm">
            📍 Ping
          </Button>
        </div>
      </div>
    </div>
  );
};