import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterSelect } from './CharacterSelect';

describe('CharacterSelect', () => {
  const mockOnSelectClass = vi.fn();

  beforeEach(() => {
    mockOnSelectClass.mockClear();
  });

  it('should render all four character classes', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Ranger')).toBeInTheDocument();
    expect(screen.getByText('Mage')).toBeInTheDocument();
    expect(screen.getByText('Cleric')).toBeInTheDocument();
  });

  it('should display class descriptions', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    expect(screen.getByText('Tank/Melee DPS')).toBeInTheDocument();
    expect(screen.getByText('Ranged DPS/Scout')).toBeInTheDocument();
    expect(screen.getByText('AoE Damage/Control')).toBeInTheDocument();
    expect(screen.getByText('Support/Healer')).toBeInTheDocument();
  });

  it('should display health points for each class', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    expect(screen.getByText('120 HP')).toBeInTheDocument(); // Warrior
    expect(screen.getByText('80 HP')).toBeInTheDocument();  // Ranger
    expect(screen.getByText('60 HP')).toBeInTheDocument();  // Mage
    expect(screen.getByText('100 HP')).toBeInTheDocument(); // Cleric
  });

  it('should highlight selected class when clicked', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    const warriorCard = screen.getByTestId('class-card-warrior');
    fireEvent.click(warriorCard);
    
    expect(warriorCard).toHaveClass('ring-2');
    expect(warriorCard).toHaveClass('ring-umbral-orange');
  });

  it('should call onSelectClass when a class is clicked', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    const rangerCard = screen.getByTestId('class-card-ranger');
    fireEvent.click(rangerCard);
    
    expect(mockOnSelectClass).toHaveBeenCalledWith('ranger');
  });

  it('should update selection when different class is clicked', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    const mageCard = screen.getByTestId('class-card-mage');
    const clericCard = screen.getByTestId('class-card-cleric');
    
    fireEvent.click(mageCard);
    expect(mageCard).toHaveClass('ring-2');
    
    fireEvent.click(clericCard);
    expect(clericCard).toHaveClass('ring-2');
    expect(mageCard).not.toHaveClass('ring-2');
  });

  it('should allow passing in initial selected class', () => {
    render(<CharacterSelect selectedClass="mage" onSelectClass={mockOnSelectClass} />);
    
    const mageCard = screen.getByTestId('class-card-mage');
    expect(mageCard).toHaveClass('ring-2');
  });

  it('should show abilities preview when hovering over class', async () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    const warriorCard = screen.getByTestId('class-card-warrior');
    fireEvent.mouseEnter(warriorCard);
    
    // Check if abilities are shown
    expect(screen.getByText('Shield Bash')).toBeInTheDocument();
    expect(screen.getByText('Rallying Cry')).toBeInTheDocument();
    expect(screen.getByText('Whirlwind')).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(<CharacterSelect onSelectClass={mockOnSelectClass} />);
    
    const warriorCard = screen.getByTestId('class-card-warrior');
    warriorCard.focus();
    
    fireEvent.keyDown(warriorCard, { key: 'Enter' });
    expect(mockOnSelectClass).toHaveBeenCalledWith('warrior');
    
    fireEvent.keyDown(warriorCard, { key: ' ' });
    expect(mockOnSelectClass).toHaveBeenCalledTimes(2);
  });
});