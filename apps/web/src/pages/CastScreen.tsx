import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const CastScreen: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-umbral-card/20 border-b border-umbral-orange/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-umbral-orange">Umbral Nexus</h1>
            <p className="text-sm text-muted-foreground">Game ID: {gameId} • Floor 1 • Turn 1</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Players</p>
              <p className="font-bold">4/4</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Enemies</p>
              <p className="font-bold text-red-400">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 h-[calc(100vh-80px)]">
        {/* Main Game View */}
        <div className="col-span-3 bg-slate-900 relative">
          {/* Game Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗡️</div>
              <h2 className="text-2xl font-bold text-umbral-orange mb-2">Dungeon Floor 1</h2>
              <p className="text-muted-foreground">Procedural dungeon map would render here</p>
              <div className="mt-8 grid grid-cols-4 gap-4 max-w-md">
                {/* Player indicators */}
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">⚔️</div>
                  <p className="text-xs">Warrior</p>
                </div>
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🏹</div>
                  <p className="text-xs">Ranger</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🔮</div>
                  <p className="text-xs">Mage</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">✨</div>
                  <p className="text-xs">Cleric</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-umbral-card/10 p-4 space-y-4 overflow-y-auto">
          {/* Turn Timer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Turn Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-umbral-orange">23</div>
                <p className="text-xs text-muted-foreground">seconds remaining</p>
                <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-2">
                  <div className="bg-umbral-orange h-2 rounded-full transition-all duration-1000" style={{ width: '75%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Party Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚔️</span>
                  <span className="text-sm">Warrior</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">120/120</div>
                  <div className="text-xs text-umbral-orange">3 AP</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏹</span>
                  <span className="text-sm">Ranger</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">80/80</div>
                  <div className="text-xs text-umbral-orange">3 AP</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔮</span>
                  <span className="text-sm">Mage</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">60/60</div>
                  <div className="text-xs text-umbral-orange">3 AP</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm">Cleric</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">100/100</div>
                  <div className="text-xs text-umbral-orange">3 AP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combat Log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Combat Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="text-green-400">⚔️ Warrior deals 15 damage to Goblin</div>
                <div className="text-blue-400">🏹 Ranger uses Quick Shot on Orc</div>
                <div className="text-purple-400">🔮 Mage casts Frost Bolt</div>
                <div className="text-yellow-400">✨ Cleric prepares Heal</div>
                <div className="text-muted-foreground">Turn 1 begins...</div>
              </div>
            </CardContent>
          </Card>

          {/* Nexus Echoes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Echoes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">🔥</span>
                  <span>Berserker Rage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🛡️</span>
                  <span>Stone Skin</span>
                </div>
                <p className="text-muted-foreground mt-2">Power-ups acquired from defeating bosses</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};