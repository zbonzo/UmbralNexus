import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CharacterSelection } from './CharacterSelection';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ gameId: 'TEST123' })
  };
});

describe('CharacterSelection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render character selection page', () => {
    renderWithRouter(<CharacterSelection />);
    
    expect(screen.getByText('Character Selection')).toBeInTheDocument();
    expect(screen.getByText('Game ID: TEST123')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Class')).toBeInTheDocument();
  });

  it('should display all character classes', () => {
    renderWithRouter(<CharacterSelection />);
    
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Ranger')).toBeInTheDocument();
    expect(screen.getByText('Mage')).toBeInTheDocument();
    expect(screen.getByText('Cleric')).toBeInTheDocument();
  });

  it('should update confirm button when class is selected', () => {
    renderWithRouter(<CharacterSelection />);
    
    const confirmButton = screen.getByRole('button', { name: /select a class/i });
    expect(confirmButton).toBeDisabled();
    
    const warriorCard = screen.getByTestId('class-card-warrior');
    fireEvent.click(warriorCard);
    
    expect(screen.getByRole('button', { name: /confirm warrior/i })).toBeEnabled();
  });

  it('should navigate back to lobby when back button is clicked', () => {
    renderWithRouter(<CharacterSelection />);
    
    const backButton = screen.getByRole('button', { name: /back to lobby/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/lobby/TEST123');
  });

  it('should navigate back to lobby when cancel is clicked', () => {
    renderWithRouter(<CharacterSelection />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/lobby/TEST123');
  });

  it('should confirm selection and navigate to lobby', () => {
    renderWithRouter(<CharacterSelection />);
    
    // Select a class
    const mageCard = screen.getByTestId('class-card-mage');
    fireEvent.click(mageCard);
    
    // Confirm selection
    const confirmButton = screen.getByRole('button', { name: /confirm mage/i });
    fireEvent.click(confirmButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/lobby/TEST123');
  });

  it('should show selected class information when class is chosen', () => {
    renderWithRouter(<CharacterSelection />);
    
    const rangerCard = screen.getByTestId('class-card-ranger');
    fireEvent.click(rangerCard);
    
    expect(screen.getByText('Ready to Join the Adventure?')).toBeInTheDocument();
    expect(screen.getByText(/You've selected the Ranger class/)).toBeInTheDocument();
  });

  it('should not allow confirmation without selecting a class', () => {
    renderWithRouter(<CharacterSelection />);
    
    const confirmButton = screen.getByRole('button', { name: /select a class/i });
    expect(confirmButton).toBeDisabled();
    
    fireEvent.click(confirmButton);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});