import React, { useState } from 'react';
import { useGameFlowStore } from '../stores/gameFlowStore';
import { gameFlowManager } from '../services/gameFlowManager';
import { Button } from '../components/ui/button';
import { 
  HexCoordinate, 
  generateSquareHexGrid, 
  hexDistance, 
  hexEquals,
  hexNeighbors,
  HEX_DIRECTIONS,
  HEX_DIRECTION_NAMES,
  createHexCoordinate,
  HexMap,
  createHexTile,
  hexToKey
} from '../utils/hexGrid';

const generateMockHexMap = (): HexMap => {
  const hexMap = new HexMap();
  const hexGrid = generateSquareHexGrid(7); // Square grid with proper honeycomb pattern
  
  hexGrid.forEach(coord => {
    // Make all tiles floor type with no entities for testing
    const tile = createHexTile(coord, 'floor', []);
    hexMap.setTile(tile);
  });
  
  return hexMap;
};

export const GameController: React.FC = () => {
  const { gameId, selectedClass, currentPlayerName } = useGameFlowStore();
  const [actionPoints, setActionPoints] = useState(3);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [health] = useState(selectedClass === 'warrior' ? 120 : selectedClass === 'cleric' ? 100 : selectedClass === 'ranger' ? 80 : 60);
  const [playerPos] = useState<HexCoordinate>(createHexCoordinate(0, 0)); // Center of the hex grid
  const [hexMap] = useState(generateMockHexMap());
  const [hexClickCounts, setHexClickCounts] = useState<Map<string, number>>(new Map());
  const [clickMultiplier, setClickMultiplier] = useState<number>(1);

  // Comprehensive distance analysis
  React.useEffect(() => {
    const origin = createHexCoordinate(0, 0);
    
    console.log('=== COMPREHENSIVE DISTANCE ANALYSIS ===');
    
    // Define what we KNOW should be distance 1 (direct neighbors)
    const expectedNeighbors = [
      { q: 0, r: 1, name: 'north' },
      { q: 1, r: 1, name: 'northeast' },
      { q: 1, r: -1, name: 'southeast' },
      { q: 0, r: -1, name: 'south' },
      { q: -1, r: -1, name: 'southwest' },
      { q: -1, r: 1, name: 'northwest' }
    ];
    
    console.log('Direct neighbors (should all be distance 1):');
    expectedNeighbors.forEach((expected) => {
      const hex = createHexCoordinate(expected.q, expected.r);
      const distance = hexDistance(origin, hex);
      console.log(`${expected.name}: (${expected.q},${expected.r}) = d:${distance} ${distance !== 1 ? '❌ WRONG!' : '✅'}`);
    });
    
    // Just output raw data for manual analysis - no "expected" calculation
    console.log('\n=== RAW DISTANCE DATA ===');
    const testGrid = generateSquareHexGrid(3);
    const results: Array<{coord: string, actual: number}> = [];
    
    testGrid.forEach(hex => {
      if (hexEquals(hex, origin)) return; // Skip origin
      
      const actualDistance = hexDistance(origin, hex);
      results.push({
        coord: `(${hex.q},${hex.r})`,
        actual: actualDistance
      });
    });
    
    // Sort by coordinate for easier pattern recognition
    results.sort((a, b) => {
      const [aq, ar] = a.coord.match(/-?\d+/g)!.map(Number);
      const [bq, br] = b.coord.match(/-?\d+/g)!.map(Number);
      if (aq !== bq) return aq - bq;
      return ar - br;
    });
    
    console.log('All coordinates with their calculated distances:');
    results.forEach(result => {
      console.log(`${result.coord}: d:${result.actual}`);
    });
    
    // Export for analysis
    console.log('\n=== COPY THIS JSON FOR ANALYSIS ===');
    console.log(JSON.stringify(results, null, 2));
  }, []);

  const handleLeaveGame = () => {
    gameFlowManager.leaveGame();
  };

  const handleMove = (direction: string | HexCoordinate) => {
    if (actionPoints > 0) {
      if (typeof direction === 'string') {
        console.log('Moving', direction);
      } else {
        console.log('Moving to hex', direction);
      }
      setActionPoints(prev => prev - 1);
    }
  };

  const handleHexClick = (hex: HexCoordinate, event: React.MouseEvent) => {
    event.preventDefault();
    const key = hexToKey(hex);
    
    if (event.type === 'contextmenu') {
      // Right click - reset to 0
      setHexClickCounts(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    } else {
      // Left click - increment count by multiplier
      setHexClickCounts(prev => {
        const newMap = new Map(prev);
        const currentCount = newMap.get(key) || 0;
        newMap.set(key, currentCount + clickMultiplier);
        return newMap;
      });
    }
  };

  const exportResults = () => {
    const origin = createHexCoordinate(0, 0);
    const testGrid = generateSquareHexGrid(4); // Larger grid for more data
    const results: Array<{
      coord: string,
      q: number,
      r: number,
      manualDistance: number,
      calculatedDistance: number,
      isCorrect: boolean
    }> = [];
    
    testGrid.forEach(hex => {
      if (hexEquals(hex, origin)) return; // Skip origin
      
      const key = hexToKey(hex);
      const manualDistance = hexClickCounts.get(key) || 0;
      const calculatedDistance = hexDistance(origin, hex);
      
      results.push({
        coord: `(${hex.q},${hex.r})`,
        q: hex.q,
        r: hex.r,
        manualDistance,
        calculatedDistance,
        isCorrect: manualDistance === calculatedDistance
      });
    });
    
    // Sort by manual distance for easier analysis
    results.sort((a, b) => a.manualDistance - b.manualDistance);
    
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;
    
    console.log('=== DISTANCE COMPARISON RESULTS ===');
    console.log(`Accuracy: ${correctCount}/${totalCount} (${Math.round(correctCount/totalCount*100)}%)`);
    console.log('\nDetailed comparison:');
    results.forEach(result => {
      const status = result.isCorrect ? '✅' : '❌';
      console.log(`${result.coord}: manual=${result.manualDistance}, calculated=${result.calculatedDistance} ${status}`);
    });
    
    console.log('\n=== COPY THIS JSON FOR ANALYSIS ===');
    console.log(JSON.stringify(results, null, 2));
    
    // Also copy to clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      alert('Results copied to clipboard!');
    } else {
      alert('Results logged to console - copy the JSON from there');
    }
  };

  const renderHexGrid = () => {
    const viewRadius = 7;
    const visibleHexes = generateSquareHexGrid(viewRadius);
    
    // Group hexes by column (q coordinate) for flat-top rendering
    const columnMap = new Map<number, HexCoordinate[]>();
    visibleHexes.forEach(hex => {
      if (!columnMap.has(hex.q)) {
        columnMap.set(hex.q, []);
      }
      columnMap.get(hex.q)!.push(hex);
    });
    
    // Sort columns and sort hexes within each column
    const sortedColumns = Array.from(columnMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([q, hexes]) => [q, hexes.sort((a, b) => a.r - b.r)] as const);
    
    return (
      <div className="hex-grid-container">
        <div className="hex-grid">
          {sortedColumns.map(([q, hexes]) => {
            const isOddColumn = Math.abs(q) % 2 === 1;
            return (
              <div key={q} className={`hex-column ${isOddColumn ? 'hex-column--odd' : ''}`}>
                {hexes.map(hex => {
                  const key = hexToKey(hex);
                  const isPlayer = hexEquals(hex, playerPos);
                  const calculatedDistance = hexDistance(hex, playerPos);
                  const manualDistance = hexClickCounts.get(key) || 0;
                  
                  let tileClass = 'hex-tile ';
                  
                  if (isPlayer) {
                    tileClass += 'hex-tile--player'; // Green for player position
                  } else if (manualDistance === 0) {
                    tileClass += 'hex-tile--floor'; // Gray for not clicked yet
                  } else if (manualDistance === calculatedDistance) {
                    tileClass += 'hex-tile--correct'; // Green for correct distance
                  } else {
                    tileClass += 'hex-tile--incorrect'; // Red for incorrect distance
                  }
                  
                  // Create tooltip text
                  let tooltipText = '';
                  if (isPlayer) {
                    tooltipText = `Player position (0,0)`;
                  } else {
                    tooltipText = `(${hex.q},${hex.r}) - Manual: ${manualDistance}, Calculated: ${calculatedDistance}`;
                  }
                  
                  return (
                    <div
                      key={key}
                      className={tileClass}
                      onClick={(e) => handleHexClick(hex, e)}
                      onContextMenu={(e) => handleHexClick(hex, e)}
                      title={tooltipText}
                    >
                      {/* Show coordinates and click count */}
                      <div className="flex flex-col items-center justify-center text-[6px] leading-tight opacity-70">
                        <span>{hex.q},{hex.r}</span>
                        {!isPlayer && <span>clicks:{manualDistance}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleUseAbility = (ability: string) => {
    if (actionPoints >= 1) {
      console.log('Using ability:', ability);
      setActionPoints(prev => prev - 1);
      setSelectedAbility(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Game View Section */}
        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold text-umbral-orange">{currentPlayerName || 'Player'}</h1>
                <p className="text-sm text-muted-foreground">Game: {gameId || 'Loading...'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLeaveGame}>
                Leave Game
              </Button>
            </div>

            {/* Local Hex Game View */}
            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-muted-foreground">Distance Testing Grid</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportResults}
                  className="text-xs"
                >
                  Export Results
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Left click = add {clickMultiplier} to distance, Right click = reset to 0
              </div>
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">Click value:</div>
                <div className="flex gap-1 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Button
                      key={num}
                      variant={clickMultiplier === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClickMultiplier(num)}
                      className="w-10 h-8 p-0 text-xs"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="max-w-lg mx-auto bg-black rounded-lg p-6 overflow-hidden">
                {renderHexGrid()}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--player" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Origin (0,0)</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--floor" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Not Set</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--correct" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Correct</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--incorrect" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Incorrect</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full lg:w-96 bg-card/95 p-4 lg:border-l border-border/50 overflow-y-auto">
          {/* Player Status - Compact */}
          <div className="mb-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                {selectedClass === 'warrior' && '⚔️ Warrior'}
                {selectedClass === 'ranger' && '🏹 Ranger'}
                {selectedClass === 'mage' && '🔮 Mage'}
                {selectedClass === 'cleric' && '✨ Cleric'}
                {!selectedClass && '❓ No Class'}
              </h3>
              <span className="text-sm font-medium text-umbral-orange">AP: {actionPoints}/3</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Health</span>
                <span>{health}/{health}</span>
              </div>
              <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Hex Movement Controls */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Movement (1 AP)</h3>
            <div className="relative w-32 h-32 mx-auto">
              {/* Center AP display */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center text-xs text-muted-foreground border">
                {actionPoints}
              </div>
              
              {/* Six hex direction buttons */}
              {HEX_DIRECTIONS.map((_, index) => {
                // For flat-top hexagons, adjust angles to match the new orientation
                const angle = (index * 60) - 60; // Start from northeast, rotate 60° each
                const radian = (angle * Math.PI) / 180;
                const radius = 40;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                
                // Update symbols for flat-top orientation
                const directionSymbols = ['→', '↗', '↖', '←', '↙', '↘'];
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`
                    }}
                    onClick={() => handleMove(HEX_DIRECTION_NAMES[index] || 'unknown')}
                    disabled={actionPoints === 0}
                    title={HEX_DIRECTION_NAMES[index]}
                  >
                    {directionSymbols[index]}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Abilities - Compact Grid */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Abilities</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={selectedAbility === 'shield-bash' ? 'default' : 'outline'}
                className="p-2 h-20 flex flex-col items-center justify-center gap-1"
                onClick={() => handleUseAbility('shield-bash')}
                disabled={actionPoints === 0}
              >
                <span className="text-2xl">🛡️</span>
                <span className="text-xs">Shield Bash</span>
                <span className="text-xs text-muted-foreground">1 AP</span>
              </Button>
              <Button 
                variant={selectedAbility === 'rallying-cry' ? 'default' : 'outline'}
                className="p-2 h-20 flex flex-col items-center justify-center gap-1"
                onClick={() => handleUseAbility('rallying-cry')}
                disabled={actionPoints < 2}
              >
                <span className="text-2xl">📢</span>
                <span className="text-xs">Rally</span>
                <span className="text-xs text-muted-foreground">2 AP</span>
              </Button>
              <Button 
                variant={selectedAbility === 'whirlwind' ? 'default' : 'outline'}
                className="p-2 h-20 flex flex-col items-center justify-center gap-1"
                onClick={() => handleUseAbility('whirlwind')}
                disabled={actionPoints < 3}
              >
                <span className="text-2xl">🌪️</span>
                <span className="text-xs">Whirlwind</span>
                <span className="text-xs text-muted-foreground">3 AP</span>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-auto">
            <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-12">
                <span className="mr-1">💬</span> Emote
              </Button>
              <Button variant="outline" size="sm" className="h-12">
                <span className="mr-1">📍</span> Ping
              </Button>
            </div>
          </div>

          {/* Turn Timer */}
          <div className="mt-4 p-3 bg-muted/20 rounded-lg text-center">
            <span className="text-xs text-muted-foreground">Turn Timer</span>
            <div className="text-2xl font-bold text-umbral-orange">0:30</div>
          </div>
        </div>
      </div>
    </div>
  );
};