import React, { useState } from 'react';
import { gameFlowManager } from '../services/gameFlowManager';
import { HeroSection } from '../components/landing/HeroSection';
import { CharacterClasses } from '../components/landing/CharacterClasses';
import { GameFeatures } from '../components/landing/GameFeatures';
import { Button } from '../components/ui/button';
import { SimpleJoinGameForm } from '../components/game/SimpleJoinGameForm';
import { SimpleCreateGameForm } from '../components/game/SimpleCreateGameForm';

export const LandingPage: React.FC = () => {
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);

  const handleCreateGame = () => {
    setShowCreateGame(true);
  };

  const handleJoinGame = () => {
    setShowJoinGame(true);
  };

  const handleGameCreated = async (config: { hostName: string; playerCap: number; difficulty: string }) => {
    setShowCreateGame(false);
    await gameFlowManager.createGame(config);
  };

  const handleGameJoined = async (gameCode: string, playerName: string) => {
    setShowJoinGame(false);
    await gameFlowManager.joinGame(gameCode, playerName);
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

      {/* Create Game Modal */}
      {showCreateGame && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <SimpleCreateGameForm
            onCreate={handleGameCreated}
            onCancel={() => setShowCreateGame(false)}
          />
        </div>
      )}

      {/* Join Game Modal */}
      {showJoinGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <SimpleJoinGameForm
            onJoin={handleGameJoined}
            onCancel={() => setShowJoinGame(false)}
          />
        </div>
      )}
    </div>
  );
};