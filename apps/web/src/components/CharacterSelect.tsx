import React, { useState } from 'react';
import type { CharacterClassData } from '@umbral-nexus/shared';

interface CharacterSelectProps {
  selectedClass?: string;
  onSelectClass: (classId: string) => void;
}

const CHARACTER_CLASSES: CharacterClassData[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    icon: '⚔️',
    description: 'The stalwart defender who stands between allies and danger',
    health: 120,
    abilities: [
      { id: 'shield-bash', name: 'Shield Bash', cost: 1, description: 'Stun an enemy for 1 turn with a devastating shield strike' },
      { id: 'rallying-cry', name: 'Rallying Cry', cost: 2, description: 'Inspire allies, boosting team defense by 50%' },
      { id: 'whirlwind', name: 'Whirlwind', cost: 3, description: 'Spin with blade extended, damaging all nearby enemies' }
    ]
  },
  {
    id: 'ranger',
    name: 'Ranger',
    icon: '🏹',
    description: 'Master marksman who excels at long-range combat and scouting',
    health: 80,
    abilities: [
      { id: 'quick-shot', name: 'Quick Shot', cost: 1, description: 'Fire a swift arrow with deadly precision' },
      { id: 'mark-target', name: 'Mark Target', cost: 2, description: 'Mark an enemy to take +50% damage from all sources' },
      { id: 'arrow-storm', name: 'Arrow Storm', cost: 3, description: 'Rain a volley of arrows over a large area' }
    ]
  },
  {
    id: 'mage',
    name: 'Mage',
    icon: '🔮',
    description: 'Wielder of arcane forces with devastating area-of-effect spells',
    health: 60,
    abilities: [
      { id: 'frost-bolt', name: 'Frost Bolt', cost: 1, description: 'Launch icy projectile that slows enemy movement' },
      { id: 'teleport', name: 'Teleport', cost: 2, description: 'Instantly transport to any visible location' },
      { id: 'meteor', name: 'Meteor', cost: 3, description: 'Call down a massive meteor dealing enormous area damage' }
    ]
  },
  {
    id: 'cleric',
    name: 'Cleric',
    icon: '✨',
    description: 'Divine healer who keeps the party alive through sacred magic',
    health: 100,
    abilities: [
      { id: 'heal', name: 'Divine Heal', cost: 1, description: 'Channel divine energy to restore 30 HP to an ally' },
      { id: 'blessing', name: 'Sacred Blessing', cost: 2, description: 'Grant an ally divine protection, reducing damage taken' },
      { id: 'sanctuary', name: 'Sanctuary', cost: 3, description: 'Create a blessed zone that protects all within' }
    ]
  }
];

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ 
  selectedClass: initialSelectedClass,
  onSelectClass 
}) => {
  const [selectedClass, setSelectedClass] = useState<string | undefined>(initialSelectedClass);
  const [focusedClass, setFocusedClass] = useState<string | undefined>(initialSelectedClass || 'warrior');

  const focusedClassData = CHARACTER_CLASSES.find(c => c.id === focusedClass) || CHARACTER_CLASSES[0]!;

  const handleSelectClass = (classId: string) => {
    setSelectedClass(classId);
    setFocusedClass(classId);
    onSelectClass(classId);
  };

  const handleFocusClass = (classId: string) => {
    setFocusedClass(classId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Main Character Display */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Character Info */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="text-6xl lg:text-7xl">
                  {focusedClassData.icon}
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {focusedClassData.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-semibold">{focusedClassData.health} HP</span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                {focusedClassData.description}
              </p>

              {selectedClass === focusedClass && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 font-medium">Selected</span>
                </div>
              )}
            </div>

            {/* Abilities */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-200 mb-4">Class Abilities</h3>
              {focusedClassData.abilities.map((ability) => (
                <div 
                  key={ability.id}
                  className="group bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium group-hover:text-slate-100">
                      {ability.name}
                    </h4>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs">
                      <span className="text-blue-300 font-medium">{ability.cost}</span>
                      <span className="text-blue-400">AP</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {ability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CHARACTER_CLASSES.map((characterClass) => (
          <button
            key={characterClass.id}
            onClick={() => handleSelectClass(characterClass.id)}
            onMouseEnter={() => handleFocusClass(characterClass.id)}
            className={`
              group relative p-4 rounded-xl border-2 transition-all duration-200
              ${selectedClass === characterClass.id 
                ? 'border-emerald-400 bg-emerald-600/10' 
                : focusedClass === characterClass.id
                ? 'border-slate-400 bg-slate-600/10'
                : 'border-slate-600 bg-slate-800/20 hover:border-slate-500 hover:bg-slate-700/20'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{characterClass.icon}</div>
              <h3 className={`font-semibold transition-colors ${
                selectedClass === characterClass.id ? 'text-emerald-300' : 'text-white'
              }`}>
                {characterClass.name}
              </h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">{characterClass.health}</span>
              </div>
            </div>

            {selectedClass === characterClass.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};