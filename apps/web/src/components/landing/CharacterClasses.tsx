import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const characterClasses = [
  {
    name: 'Warrior',
    emoji: '⚔️',
    color: 'bg-classes-warrior',
    borderColor: 'border-classes-warrior/50',
    description: 'Tank and melee damage dealer',
    stats: { hp: 120, role: 'Tank/DPS' }
  },
  {
    name: 'Ranger',
    emoji: '🏹',
    color: 'bg-classes-ranger',
    borderColor: 'border-classes-ranger/50',
    description: 'Ranged damage and scouting',
    stats: { hp: 80, role: 'Ranged DPS' }
  },
  {
    name: 'Mage',
    emoji: '🔮',
    color: 'bg-classes-mage',
    borderColor: 'border-classes-mage/50',
    description: 'Area damage and control',
    stats: { hp: 60, role: 'AoE/Control' }
  },
  {
    name: 'Cleric',
    emoji: '✨',
    color: 'bg-classes-cleric',
    borderColor: 'border-classes-cleric/50',
    description: 'Support and healing',
    stats: { hp: 100, role: 'Support/Healer' }
  }
];

export const CharacterClasses: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-umbral-orange">
        Choose Your Class
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {characterClasses.map((charClass) => (
          <Card 
            key={charClass.name}
            className={`hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 ${charClass.borderColor}`}
          >
            <CardHeader className="text-center pb-2">
              <div className={`w-16 h-16 rounded-full ${charClass.color} mx-auto mb-3 flex items-center justify-center text-2xl shadow-lg`}>
                {charClass.emoji}
              </div>
              <CardTitle className="text-xl">{charClass.name}</CardTitle>
              <CardDescription className="text-sm">
                {charClass.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>HP:</span>
                  <span className="font-semibold">{charClass.stats.hp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-semibold">{charClass.stats.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <p className="text-center text-muted-foreground mt-6 text-sm">
        Each class has unique abilities and playstyles. Choose based on your preferred role in the party!
      </p>
    </div>
  );
};