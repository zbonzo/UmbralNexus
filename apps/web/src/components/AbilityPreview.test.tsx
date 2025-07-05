import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AbilityPreview } from './AbilityPreview';

describe('AbilityPreview', () => {
  const mockAbility = {
    id: 'shield-bash',
    name: 'Shield Bash',
    cost: 1,
    description: 'Stun an enemy for 1 turn'
  };

  it('should render ability information', () => {
    render(<AbilityPreview ability={mockAbility} />);
    
    expect(screen.getByText('Shield Bash')).toBeInTheDocument();
    expect(screen.getByText('1 AP')).toBeInTheDocument();
    expect(screen.getByText('Stun an enemy for 1 turn')).toBeInTheDocument();
  });

  it('should display correct AP cost styling', () => {
    render(<AbilityPreview ability={mockAbility} />);
    
    const apBadge = screen.getByText('1 AP');
    expect(apBadge).toHaveClass('bg-umbral-orange/20');
    expect(apBadge).toHaveClass('text-umbral-orange');
  });

  it('should handle abilities with no description', () => {
    const abilityNoDesc = {
      id: 'basic-attack',
      name: 'Basic Attack',
      cost: 1
    };
    
    render(<AbilityPreview ability={abilityNoDesc} />);
    
    expect(screen.getByText('Basic Attack')).toBeInTheDocument();
    expect(screen.getByText('1 AP')).toBeInTheDocument();
  });

  it('should apply custom className if provided', () => {
    render(<AbilityPreview ability={mockAbility} className="custom-class" />);
    
    const container = screen.getByTestId('ability-preview');
    expect(container).toHaveClass('custom-class');
  });

  it('should handle multi-cost abilities', () => {
    const multiCostAbility = {
      id: 'whirlwind',
      name: 'Whirlwind',
      cost: 3,
      description: 'Damage all nearby enemies'
    };
    
    render(<AbilityPreview ability={multiCostAbility} />);
    
    expect(screen.getByText('3 AP')).toBeInTheDocument();
  });

  it('should render multiple abilities in a list', () => {
    const abilities = [
      { id: 'shield-bash', name: 'Shield Bash', cost: 1, description: 'Stun an enemy' },
      { id: 'rallying-cry', name: 'Rallying Cry', cost: 2, description: 'Boost team defense' },
      { id: 'whirlwind', name: 'Whirlwind', cost: 3, description: 'Damage all nearby' }
    ];
    
    render(
      <div>
        {abilities.map(ability => (
          <AbilityPreview key={ability.id} ability={ability} />
        ))}
      </div>
    );
    
    expect(screen.getByText('Shield Bash')).toBeInTheDocument();
    expect(screen.getByText('Rallying Cry')).toBeInTheDocument();
    expect(screen.getByText('Whirlwind')).toBeInTheDocument();
    
    // Check all AP costs are rendered
    expect(screen.getByText('1 AP')).toBeInTheDocument();
    expect(screen.getByText('2 AP')).toBeInTheDocument();
    expect(screen.getByText('3 AP')).toBeInTheDocument();
  });
});