import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LandingPage } from './LandingPage';

// Mock the child components to focus on navigation logic
vi.mock('../components/landing/HeroSection', () => ({
  HeroSection: ({ onCreateGame, onJoinGame }: any) => (
    <div data-testid="hero-section">
      <button onClick={onCreateGame} data-testid="create-game-button">
        Create Game
      </button>
      <button onClick={onJoinGame} data-testid="join-game-button">
        Join Game
      </button>
    </div>
  )
}));

vi.mock('../components/landing/CharacterClasses', () => ({
  CharacterClasses: () => <div data-testid="character-classes">Character Classes</div>
}));

vi.mock('../components/landing/GameFeatures', () => ({
  GameFeatures: () => <div data-testid="game-features">Game Features</div>
}));

vi.mock('../components/game/SimpleCreateGameForm', () => ({
  SimpleCreateGameForm: ({ onCreate, onCancel }: any) => (
    <div data-testid="create-game-form">
      <button onClick={() => onCreate({ hostName: 'Test Host', playerCap: 4, difficulty: 'normal' })}>
        Create
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../components/game/SimpleJoinGameForm', () => ({
  SimpleJoinGameForm: ({ onJoin, onCancel, initialGameCode }: any) => (
    <div data-testid="join-game-form">
      <div data-testid="initial-game-code">{initialGameCode || 'no-code'}</div>
      <button onClick={() => onJoin('ABC123', 'Test Player')}>
        Join
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ gameId: undefined })
  };
});

describe('LandingPage Navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderLandingPage = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <LandingPage />
      </MemoryRouter>
    );
  };

  test('renders main sections', () => {
    renderLandingPage();
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('character-classes')).toBeInTheDocument();
    expect(screen.getByTestId('game-features')).toBeInTheDocument();
  });

  test('shows create game form when create button clicked', () => {
    renderLandingPage();
    
    const createButton = screen.getByTestId('create-game-button');
    fireEvent.click(createButton);
    
    expect(screen.getByTestId('create-game-form')).toBeInTheDocument();
  });

  test('shows join game form when join button clicked', () => {
    renderLandingPage();
    
    const joinButton = screen.getByTestId('join-game-button');
    fireEvent.click(joinButton);
    
    expect(screen.getByTestId('join-game-form')).toBeInTheDocument();
  });

  test('navigates to lobby when game is created', async () => {
    renderLandingPage();
    
    // Open create game form
    const createButton = screen.getByTestId('create-game-button');
    fireEvent.click(createButton);
    
    // Submit the form
    const createFormButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createFormButton);
    
    // Check that navigate was called with lobby route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/lobby\/[A-Z0-9]{6}$/)
      );
    });
  });

  test('navigates to game controller when game is joined', async () => {
    renderLandingPage();
    
    // Open join game form
    const joinButton = screen.getByTestId('join-game-button');
    fireEvent.click(joinButton);
    
    // Submit the form
    const joinFormButton = screen.getByRole('button', { name: 'Join' });
    fireEvent.click(joinFormButton);
    
    // Check that navigate was called with game route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/game/ABC123');
    });
  });

  test('closes modals when cancel is clicked', () => {
    renderLandingPage();
    
    // Test create game modal
    fireEvent.click(screen.getByTestId('create-game-button'));
    expect(screen.getByTestId('create-game-form')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('create-game-form')).not.toBeInTheDocument();
    
    // Test join game modal
    fireEvent.click(screen.getByTestId('join-game-button'));
    expect(screen.getByTestId('join-game-form')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('join-game-form')).not.toBeInTheDocument();
  });
});