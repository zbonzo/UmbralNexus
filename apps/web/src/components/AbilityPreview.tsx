import React from 'react';

interface Ability {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

interface AbilityPreviewProps {
  ability: Ability;
  className?: string;
}

export const AbilityPreview: React.FC<AbilityPreviewProps> = ({ ability, className = '' }) => {
  return (
    <div 
      data-testid="ability-preview"
      className={`flex items-start gap-3 p-2 ${className}`}
    >
      <div className="flex-1">
        <h4 className="font-medium text-sm">{ability.name}</h4>
        {ability.description && (
          <p className="text-xs text-muted-foreground mt-1">{ability.description}</p>
        )}
      </div>
      <span className="text-xs bg-umbral-orange/20 text-umbral-orange px-2 py-1 rounded font-medium">
        {ability.cost} AP
      </span>
    </div>
  );
};