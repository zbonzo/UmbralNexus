import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const features = [
  {
    icon: '🎯',
    title: 'Strategic Combat',
    description: 'Action Point system with 30-second turns. Every decision matters in cooperative battles.'
  },
  {
    icon: '🌟',
    title: 'Nexus Echoes',
    description: '200+ unique power-ups that stack and synergize. Build exponentially powerful combinations.'
  },
  {
    icon: '🏰',
    title: 'Multi-Floor Dungeons',
    description: 'Explore procedurally generated floors. Split your party or stick together - the choice is yours.'
  },
  {
    icon: '👥',
    title: 'Scalable Groups',
    description: 'Perfect for any group size from intimate 2-player sessions to epic 20-player raids.'
  },
  {
    icon: '📱',
    title: 'Multi-Screen Play',
    description: 'Use phones as controllers while viewing the main game on a shared screen or stream.'
  },
  {
    icon: '⚡',
    title: 'Zero Friction',
    description: 'No downloads, no accounts, no setup. Just scan a QR code and start playing instantly.'
  }
];

export const GameFeatures: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-umbral-orange">
        Game Features
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{feature.icon}</div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};