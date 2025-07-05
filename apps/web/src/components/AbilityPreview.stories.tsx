import type { Meta, StoryObj } from '@storybook/react';
import { AbilityPreview } from './AbilityPreview';

const meta: Meta<typeof AbilityPreview> = {
  title: 'Game/AbilityPreview',
  component: AbilityPreview,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WarriorShieldBash: Story = {
  args: {
    ability: {
      id: 'shield-bash',
      name: 'Shield Bash',
      cost: 1,
      description: 'Stun an enemy for 1 turn',
    },
  },
};

export const MageMeteor: Story = {
  args: {
    ability: {
      id: 'meteor',
      name: 'Meteor',
      cost: 3,
      description: 'Massive area damage that devastates all enemies in the target zone',
    },
  },
};

export const ClericHeal: Story = {
  args: {
    ability: {
      id: 'heal',
      name: 'Heal',
      cost: 1,
      description: 'Restore 30 HP to target ally',
    },
  },
};

export const NoDescription: Story = {
  args: {
    ability: {
      id: 'basic-attack',
      name: 'Basic Attack',
      cost: 1,
    },
  },
};

export const HighCostAbility: Story = {
  args: {
    ability: {
      id: 'ultimate',
      name: 'Ultimate Destruction',
      cost: 5,
      description: 'Channel the power of the nexus to unleash devastating magic',
    },
  },
};

export const WithCustomClass: Story = {
  args: {
    ability: {
      id: 'custom',
      name: 'Custom Ability',
      cost: 2,
      description: 'This ability has custom styling',
    },
    className: 'border-2 border-orange-500 bg-orange-50',
  },
};