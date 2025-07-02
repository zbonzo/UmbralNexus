import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-umbral-orange mb-4 glow-text animate-pulse-slow">
          Umbral Nexus
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The ultimate cooperative roguelike experience for 1-20 players
        </p>
        
        <Card className="mb-8 glow-border">
          <CardHeader>
            <CardTitle>Phase 1: Design System</CardTitle>
            <CardDescription>
              Building the foundation with Radix UI and Tailwind CSS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center mb-4">
              <Button variant="default">Create Game</Button>
              <Button variant="outline">Join Game</Button>
              <Button variant="ghost">How to Play</Button>
            </div>
            
            <div className="flex gap-2 justify-center items-center">
              <span className="text-sm text-muted-foreground">Character Classes:</span>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-classes-warrior border-2 border-classes-warrior/50" title="Warrior"></div>
                <div className="w-6 h-6 rounded-full bg-classes-ranger border-2 border-classes-ranger/50" title="Ranger"></div>
                <div className="w-6 h-6 rounded-full bg-classes-mage border-2 border-classes-mage/50" title="Mage"></div>
                <div className="w-6 h-6 rounded-full bg-classes-cleric border-2 border-classes-cleric/50" title="Cleric"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-sm text-muted-foreground">
          Design system ready • Components integrated • Theme applied
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);