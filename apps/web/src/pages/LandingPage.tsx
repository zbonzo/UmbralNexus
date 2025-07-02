import React, { useState } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { CharacterClasses } from '../components/landing/CharacterClasses';
import { GameFeatures } from '../components/landing/GameFeatures';
import { Button } from '../components/ui/button';

export const LandingPage: React.FC = () => {
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);

  const handleCreateGame = () => {
    // TODO: Implement game creation modal/flow
    console.log('Create game clicked');
    setShowCreateGame(true);
  };

  const handleJoinGame = () => {
    // TODO: Implement join game modal/flow
    console.log('Join game clicked');
    setShowJoinGame(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <HeroSection 
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
        />
      </section>

      {/* Character Classes Section */}
      <section className="py-16 px-4 bg-umbral-card/20">
        <CharacterClasses />
      </section>

      {/* Game Features Section */}
      <section className="py-16 px-4">
        <GameFeatures />
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-umbral-orange/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm">
              How to Play
            </Button>
            <Button variant="ghost" size="sm">
              About
            </Button>
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Umbral Nexus • Phase 1: Design System Complete • Built with React & Tailwind
          </p>
        </div>
      </footer>

      {/* Temporary debug modals */}
      {showCreateGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-umbral-card p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-umbral-orange">Create Game</h3>
            <p className="text-muted-foreground mb-4">
              Game creation flow will be implemented in Phase 2
            </p>
            <Button onClick={() => setShowCreateGame(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {showJoinGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-umbral-card p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-umbral-orange">Join Game</h3>
            <p className="text-muted-foreground mb-4">
              Game joining flow will be implemented in Phase 2
            </p>
            <Button onClick={() => setShowJoinGame(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};