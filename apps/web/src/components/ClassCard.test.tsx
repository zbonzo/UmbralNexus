import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassCard } from './ClassCard';

describe('ClassCard', () => {
  const mockOnClick = vi.fn();

  const warriorClass = {
    id: 'warrior',
    name: 'Warrior',
    icon: '⚔️',
    description: 'Tank/Melee DPS',
    health: 120,
    abilities: [
      { id: 'shield-bash', name: 'Shield Bash', cost: 1, description: 'Stun an enemy' },
      { id: 'rallying-cry', name: 'Rallying Cry', cost: 2, description: 'Boost team defense' },
      { id: 'whirlwind', name: 'Whirlwind', cost: 3, description: 'Damage all nearby enemies' }
    ]
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render class information', () => {
    render(<ClassCard characterClass={warriorClass} onClick={mockOnClick} />);
    
    expect(screen.getByText('⚔️')).toBeInTheDocument();
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Tank/Melee DPS')).toBeInTheDocument();
    expect(screen.getByText('120 HP')).toBeInTheDocument();
  });

  it('should apply selected styles when selected', () => {
    render(<ClassCard characterClass={warriorClass} isSelected={true} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('class-card-warrior');
    expect(card).toHaveClass('ring-2');
    expect(card).toHaveClass('ring-umbral-orange');
  });

  it('should not apply selected styles when not selected', () => {
    render(<ClassCard characterClass={warriorClass} isSelected={false} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('class-card-warrior');
    expect(card).not.toHaveClass('ring-2');
  });

  it('should call onClick when clicked', () => {
    render(<ClassCard characterClass={warriorClass} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('class-card-warrior');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith('warrior');
  });

  it('should show abilities on hover', () => {
    render(<ClassCard characterClass={warriorClass} onClick={mockOnClick} showAbilitiesOnHover />);
    
    const card = screen.getByTestId('class-card-warrior');
    
    // Abilities should not be visible initially
    expect(screen.queryByText('Shield Bash')).not.toBeInTheDocument();
    
    // Hover over card
    fireEvent.mouseEnter(card);
    
    // Abilities should now be visible
    expect(screen.getByText('Shield Bash')).toBeInTheDocument();
    expect(screen.getByText('1 AP')).toBeInTheDocument();
    expect(screen.getByText('Stun an enemy')).toBeInTheDocument();
    
    // Leave hover
    fireEvent.mouseLeave(card);
    
    // Abilities should be hidden again
    expect(screen.queryByText('Shield Bash')).not.toBeInTheDocument();
  });

  it('should always show abilities when showAbilities is true', () => {
    render(<ClassCard characterClass={warriorClass} onClick={mockOnClick} showAbilities />);
    
    // Abilities should be visible without hovering
    expect(screen.getByText('Shield Bash')).toBeInTheDocument();
    expect(screen.getByText('Rallying Cry')).toBeInTheDocument();
    expect(screen.getByText('Whirlwind')).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(<ClassCard characterClass={warriorClass} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('class-card-warrior');
    card.focus();
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith('warrior');
    
    mockOnClick.mockClear();
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledWith('warrior');
  });

  it('should have appropriate ARIA attributes', () => {
    render(<ClassCard characterClass={warriorClass} isSelected={true} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('class-card-warrior');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(card).toHaveAttribute('aria-label', 'Select Warrior class');
  });
});