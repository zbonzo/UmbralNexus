import React, { useState, useEffect, useRef } from 'react';
import { useGameFlowStore } from '../stores/gameFlowStore';
import { gameFlowManager } from '../services/gameFlowManager';
import { Button } from '../components/ui/button';
import { 
  HexCoordinate, 
  generateSquareHexGrid, 
  hexEquals,
  HexMap,
  createHexCoordinate,
  createHexTile,
  hexToKey
} from '../utils/hexGrid';

const generateMockHexMap = (): HexMap => {
  const hexMap = new HexMap();
  const hexGrid = generateSquareHexGrid(7);
  
  // Define some wall positions
  const wallPositions = [
    { q: 2, r: -2 },
    { q: 2, r: -1 },
    { q: 2, r: 0 },
    { q: 2, r: 1 },
    { q: 2, r: 2 },
    { q: -2, r: -1 },
    { q: -1, r: -1 },
    { q: 0, r: -1 },
    { q: -3, r: 2 },
    { q: 1, r: 3 },
  ];
  
  hexGrid.forEach(coord => {
    const isWall = wallPositions.some(wall => wall.q === coord.q && wall.r === coord.r);
    const tile = createHexTile(coord, isWall ? 'wall' : 'floor', []);
    hexMap.setTile(tile);
  });
  
  return hexMap;
};

export const GameController: React.FC = () => {
  const { gameId, selectedClass, currentPlayerName, players, currentPlayerId } = useGameFlowStore();
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; type: 'player' | 'enemy' } | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [abilityCooldowns, setAbilityCooldowns] = useState<Record<string, number>>({});
  const [hexMap] = useState(generateMockHexMap());
  const animationFrameRef = useRef<number>(0);
  
  // Mock enemies for testing
  const [enemies] = useState([
    { id: 'enemy1', name: 'Goblin', position: { x: 5, y: 5 }, health: 50, maxHealth: 50 },
    { id: 'enemy2', name: 'Orc', position: { x: 15, y: 15 }, health: 80, maxHealth: 80 },
  ]);
  
  // Find current player
  const currentPlayer = players.find(p => p.playerId === currentPlayerId);
  const currentPlayerPos = currentPlayer?.position 
    ? createHexCoordinate(currentPlayer.position.x, currentPlayer.position.y)
    : createHexCoordinate(0, 0);
  
  // Update cooldowns
  useEffect(() => {
    const updateCooldowns = () => {
      const now = Date.now();
      setAbilityCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(abilityId => {
          if (updated[abilityId] !== undefined && updated[abilityId] <= now) {
            delete updated[abilityId];
          }
        });
        return updated;
      });
      animationFrameRef.current = requestAnimationFrame(updateCooldowns);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateCooldowns);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  const handleLeaveGame = () => {
    gameFlowManager.leaveGame();
  };
  
  const handleHexClick = (hex: HexCoordinate) => {
    // Check if clicking on a player or enemy
    const clickedPlayer = players.find(p => 
      p.position && p.position.x === hex.q && p.position.y === hex.r
    );
    
    const clickedEnemy = enemies.find(e => 
      e.position && Math.floor(e.position.x) === hex.q && Math.floor(e.position.y) === hex.r
    );
    
    if (clickedPlayer && clickedPlayer.playerId !== currentPlayerId) {
      // Target another player
      setSelectedTarget({ id: clickedPlayer.playerId, type: 'player' });
      gameFlowManager.sendPlayerAction({
        type: 'SET_TARGET',
        targetId: clickedPlayer.playerId,
        targetType: 'player',
      });
    } else if (clickedEnemy) {
      // Target an enemy
      setSelectedTarget({ id: clickedEnemy.id, type: 'enemy' });
      gameFlowManager.sendPlayerAction({
        type: 'SET_TARGET',
        targetId: clickedEnemy.id,
        targetType: 'enemy',
      });
    } else {
      // Move to empty hex
      const tile = hexMap.getTile(hex);
      if (tile && tile.baseType !== 'wall') {
        gameFlowManager.sendPlayerAction({
          type: 'MOVE_TO',
          targetPosition: { x: hex.q, y: hex.r },
        });
      }
    }
  };
  
  const handleUseAbility = (abilityId: string) => {
    if (abilityCooldowns[abilityId]) return; // On cooldown
    
    if (selectedTarget) {
      gameFlowManager.sendPlayerAction({
        type: 'USE_ABILITY',
        abilityId,
        targetId: selectedTarget.id,
      });
      
      // Set local cooldown (will be synced from server)
      const ability = getAbilities().find(a => a.id === abilityId);
      if (ability) {
        setAbilityCooldowns(prev => ({
          ...prev,
          [abilityId]: Date.now() + ability.cooldownTime,
        }));
      }
    }
    
    setSelectedAbility(null);
  };
  
  const getAbilities = () => {
    // Mock abilities based on class
    switch (selectedClass) {
      case 'warrior':
        return [
          { id: 'shield-bash', name: 'Shield Bash', icon: '🛡️', cooldownTime: 3000 },
          { id: 'rallying-cry', name: 'Rally', icon: '📢', cooldownTime: 10000 },
          { id: 'whirlwind', name: 'Whirlwind', icon: '🌪️', cooldownTime: 8000 },
        ];
      case 'ranger':
        return [
          { id: 'quick-shot', name: 'Quick Shot', icon: '🏹', cooldownTime: 2000 },
          { id: 'mark-target', name: 'Mark', icon: '🎯', cooldownTime: 5000 },
          { id: 'arrow-storm', name: 'Arrow Storm', icon: '🌧️', cooldownTime: 12000 },
        ];
      case 'mage':
        return [
          { id: 'frost-bolt', name: 'Frost Bolt', icon: '❄️', cooldownTime: 2500 },
          { id: 'teleport', name: 'Teleport', icon: '✨', cooldownTime: 6000 },
          { id: 'meteor', name: 'Meteor', icon: '☄️', cooldownTime: 15000 },
        ];
      case 'cleric':
        return [
          { id: 'heal', name: 'Heal', icon: '💚', cooldownTime: 2000 },
          { id: 'blessing', name: 'Blessing', icon: '✨', cooldownTime: 8000 },
          { id: 'sanctuary', name: 'Sanctuary', icon: '🛡️', cooldownTime: 20000 },
        ];
      default:
        return [];
    }
  };
  
  const renderHexGrid = () => {
    const viewRadius = 7;
    const visibleHexes = generateSquareHexGrid(viewRadius);
    
    // Create maps for quick lookup
    const playerPositions = new Map<string, typeof players[0]>();
    const enemyPositions = new Map<string, typeof enemies[0]>();
    
    players.forEach(player => {
      if (player.position) {
        const key = hexToKey(createHexCoordinate(
          Math.floor(player.position.x), 
          Math.floor(player.position.y)
        ));
        playerPositions.set(key, player);
      }
    });
    
    enemies.forEach(enemy => {
      if (enemy.position) {
        const key = hexToKey(createHexCoordinate(
          Math.floor(enemy.position.x), 
          Math.floor(enemy.position.y)
        ));
        enemyPositions.set(key, enemy);
      }
    });
    
    // Group hexes by column
    const columnMap = new Map<number, HexCoordinate[]>();
    visibleHexes.forEach(hex => {
      if (!columnMap.has(hex.q)) {
        columnMap.set(hex.q, []);
      }
      columnMap.get(hex.q)!.push(hex);
    });
    
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
                  const tile = hexMap.getTile(hex);
                  const isCurrentPlayer = hexEquals(hex, currentPlayerPos);
                  const playerOnTile = playerPositions.get(key);
                  const enemyOnTile = enemyPositions.get(key);
                  const isWall = tile?.baseType === 'wall';
                  const isTargeted = selectedTarget && (
                    (selectedTarget.type === 'player' && playerOnTile?.playerId === selectedTarget.id) ||
                    (selectedTarget.type === 'enemy' && enemyOnTile?.id === selectedTarget.id)
                  );
                  
                  let tileClass = 'hex-tile ';
                  
                  if (isCurrentPlayer) {
                    tileClass += 'hex-tile--player';
                  } else if (enemyOnTile) {
                    tileClass += 'hex-tile--enemy';
                  } else if (playerOnTile) {
                    tileClass += 'hex-tile--other-player';
                  } else if (isWall) {
                    tileClass += 'hex-tile--wall';
                  } else {
                    tileClass += 'hex-tile--floor';
                  }
                  
                  if (isTargeted) {
                    tileClass += ' hex-tile--targeted';
                  }
                  
                  // Create tooltip
                  let tooltipText = `(${hex.q},${hex.r})`;
                  if (isCurrentPlayer) {
                    tooltipText = `You - ${tooltipText}`;
                  } else if (playerOnTile) {
                    tooltipText = `${playerOnTile.playerName} - ${tooltipText}`;
                  } else if (enemyOnTile) {
                    tooltipText = `${enemyOnTile.name} - ${tooltipText}`;
                  } else if (isWall) {
                    tooltipText = `Wall - ${tooltipText}`;
                  }
                  
                  return (
                    <div
                      key={key}
                      className={tileClass}
                      onClick={() => !isCurrentPlayer && handleHexClick(hex)}
                      title={tooltipText}
                      style={{ cursor: isWall ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="flex flex-col items-center justify-center text-[6px] leading-tight opacity-70">
                        {isCurrentPlayer && <span className="text-xs font-bold">YOU</span>}
                        {playerOnTile && !isCurrentPlayer && (
                          <span className="text-[8px] font-medium">{playerOnTile.playerName.slice(0, 3)}</span>
                        )}
                        {enemyOnTile && (
                          <span className="text-[8px] font-bold text-red-300">{enemyOnTile.name.slice(0, 3)}</span>
                        )}
                        {isWall && <span className="font-bold">WALL</span>}
                      </div>
                      {enemyOnTile && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 transition-all duration-300"
                            style={{ width: `${(enemyOnTile.health / enemyOnTile.maxHealth) * 100}%` }}
                          />
                        </div>
                      )}
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
  
  const abilities = getAbilities();
  
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

            {/* Game Map View */}
            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-muted-foreground">Real-Time Battle Arena</h2>
                {selectedTarget && (
                  <div className="text-xs text-umbral-orange">
                    Target: {selectedTarget.type === 'player' ? 
                      players.find(p => p.playerId === selectedTarget.id)?.playerName :
                      enemies.find(e => e.id === selectedTarget.id)?.name
                    }
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Click to move • Click enemy/player to target • Use abilities on target
              </div>
              <div className="max-w-lg mx-auto bg-black rounded-lg p-6 overflow-hidden">
                {renderHexGrid()}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--player" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>You</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--other-player" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Other Players</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--enemy" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Enemies</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="hex-tile hex-tile--wall" style={{width: 'calc(var(--hex-total-width) / 2)', height: 'calc(var(--hex-total-height) / 2)', flexShrink: 0}}></div>
                  <span>Wall</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full lg:w-96 bg-card/95 p-4 lg:border-l border-border/50 overflow-y-auto">
          {/* Player Status */}
          <div className="mb-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                {selectedClass === 'warrior' && '⚔️ Warrior'}
                {selectedClass === 'ranger' && '🏹 Ranger'}
                {selectedClass === 'mage' && '🔮 Mage'}
                {selectedClass === 'cleric' && '✨ Cleric'}
                {!selectedClass && '❓ No Class'}
              </h3>
              <span className="text-sm text-muted-foreground">Real-Time</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Health</span>
                <span>{currentPlayer?.health || 100}/{currentPlayer?.maxHealth || 100}</span>
              </div>
              <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentPlayer?.health || 100) / (currentPlayer?.maxHealth || 100)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Target Info */}
          {selectedTarget && (
            <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <h3 className="text-sm font-medium text-red-400 mb-1">Current Target</h3>
              <div className="text-xs text-muted-foreground">
                {selectedTarget.type === 'player' ? 
                  players.find(p => p.playerId === selectedTarget.id)?.playerName :
                  enemies.find(e => e.id === selectedTarget.id)?.name
                }
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => {
                  setSelectedTarget(null);
                  gameFlowManager.sendPlayerAction({
                    type: 'SET_TARGET',
                    targetId: null,
                    targetType: 'player',
                  });
                }}
              >
                Clear Target
              </Button>
            </div>
          )}

          {/* Abilities */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Abilities</h3>
            <div className="grid grid-cols-3 gap-2">
              {abilities.map((ability) => {
                const isOnCooldown = (abilityCooldowns[ability.id] || 0) > Date.now();
                const cooldownRemaining = Math.max(0, (abilityCooldowns[ability.id] || 0) - Date.now());
                const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);
                
                return (
                  <Button
                    key={ability.id}
                    variant={selectedAbility === ability.id ? 'default' : 'outline'}
                    className="p-2 h-20 flex flex-col items-center justify-center gap-1 relative"
                    onClick={() => handleUseAbility(ability.id)}
                    disabled={isOnCooldown || !selectedTarget}
                  >
                    <span className="text-2xl">{ability.icon}</span>
                    <span className="text-xs">{ability.name}</span>
                    {isOnCooldown && (
                      <span className="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-xs font-bold">
                        {cooldownSeconds}s
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
            {!selectedTarget && (
              <div className="text-xs text-muted-foreground mt-2">
                Select a target to use abilities
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
};