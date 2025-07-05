import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { App } from './App';

// Mock the page components to avoid complex rendering
vi.mock('./pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>
}));

vi.mock('./pages/GameLobby', () => ({
  GameLobby: () => <div data-testid="game-lobby">Game Lobby</div>
}));

vi.mock('./pages/CharacterSelection', () => ({
  CharacterSelection: () => <div data-testid="character-selection">Character Selection</div>
}));

vi.mock('./pages/GameController', () => ({
  GameController: () => <div data-testid="game-controller">Game Controller</div>
}));

vi.mock('./pages/CastScreen', () => ({
  CastScreen: () => <div data-testid="cast-screen">Cast Screen</div>
}));

describe('App Routing', () => {
  const renderWithRouter = (initialEntries: string[]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    );
  };

  test('renders landing page on root route', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  test('renders landing page on join route', () => {
    renderWithRouter(['/join/ABC123']);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  test('renders game lobby with game ID', () => {
    renderWithRouter(['/lobby/ABC123']);
    expect(screen.getByTestId('game-lobby')).toBeInTheDocument();
  });

  test('renders game controller with game ID', () => {
    renderWithRouter(['/game/ABC123']);
    expect(screen.getByTestId('game-controller')).toBeInTheDocument();
  });

  test('renders character selection with game ID', () => {
    renderWithRouter(['/character-select/ABC123']);
    expect(screen.getByTestId('character-selection')).toBeInTheDocument();
  });

  test('renders cast screen with game ID', () => {
    renderWithRouter(['/cast/ABC123']);
    expect(screen.getByTestId('cast-screen')).toBeInTheDocument();
  });
});