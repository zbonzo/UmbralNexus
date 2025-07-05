import React, { useState } from 'react';
import { AbilityPreview } from './AbilityPreview';
import type { CharacterClassData } from '@umbral-nexus/shared';

interface ClassCardProps {
  characterClass: CharacterClassData;
  isSelected?: boolean;
  onClick: (classId: string) => void;
  showAbilities?: boolean;
  showAbilitiesOnHover?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  characterClass,
  isSelected = false,
  onClick,
  showAbilities = false,
  showAbilitiesOnHover = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const shouldShowAbilities = showAbilities || (showAbilitiesOnHover && isHovered);

  const handleClick = () => {
    onClick(characterClass.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(characterClass.id);
    }
  };

  return (
    <div
      data-testid={`class-card-${characterClass.id}`}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${characterClass.name} class`}
      tabIndex={0}
      className={`
        relative cursor-pointer rounded-lg border-2 bg-card p-6 transition-all
        hover:bg-accent hover:shadow-lg
        ${isSelected ? 'ring-2 ring-umbral-orange border-umbral-orange' : 'border-border'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{characterClass.icon}</div>
        <h3 className="text-lg font-bold text-foreground">{characterClass.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{characterClass.description}</p>
        <p className="text-sm font-medium text-umbral-orange">{characterClass.health} HP</p>
      </div>

      {shouldShowAbilities && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <h4 className="text-sm font-semibold mb-2">Abilities:</h4>
          {characterClass.abilities.map((ability) => (
            <AbilityPreview key={ability.id} ability={ability} />
          ))}
        </div>
      )}
    </div>
  );
};