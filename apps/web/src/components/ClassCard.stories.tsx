import type { Meta, StoryObj } from '@storybook/react';
import { ClassCard } from './ClassCard';

const meta: Meta<typeof ClassCard> = {
  title: 'Game/ClassCard',
  component: ClassCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the class is currently selected',
    },
    showAbilities: {
      control: 'boolean',
      description: 'Always show abilities',
    },
    showAbilitiesOnHover: {
      control: 'boolean',
      description: 'Show abilities on hover',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const warriorClass = {
  id: 'warrior',
  name: 'Warrior',
  icon: '⚔️',
  description: 'Tank/Melee DPS',
  health: 120,
  abilities: [
    { id: 'shield-bash', name: 'Shield Bash', cost: 1, description: 'Stun an enemy for 1 turn' },
    { id: 'rallying-cry', name: 'Rallying Cry', cost: 2, description: 'Boost team defense by 50%' },
    { id: 'whirlwind', name: 'Whirlwind', cost: 3, description: 'Damage all nearby enemies' }
  ]
};

const rangerClass = {
  id: 'ranger',
  name: 'Ranger',
  icon: '🏹',
  description: 'Ranged DPS/Scout',
  health: 80,
  abilities: [
    { id: 'quick-shot', name: 'Quick Shot', cost: 1, description: 'Fast ranged attack' },
    { id: 'mark-target', name: 'Mark Target', cost: 2, description: '+50% damage from all sources' },
    { id: 'arrow-storm', name: 'Arrow Storm', cost: 3, description: 'Rain arrows on an area' }
  ]
};

const mageClass = {
  id: 'mage',
  name: 'Mage',
  icon: '🔮',
  description: 'AoE Damage/Control',
  health: 60,
  abilities: [
    { id: 'frost-bolt', name: 'Frost Bolt', cost: 1, description: 'Slow enemy movement' },
    { id: 'teleport', name: 'Teleport', cost: 2, description: 'Instantly move to target tile' },
    { id: 'meteor', name: 'Meteor', cost: 3, description: 'Massive area damage' }
  ]
};

const clericClass = {
  id: 'cleric',
  name: 'Cleric',
  icon: '✨',
  description: 'Support/Healer',
  health: 100,
  abilities: [
    { id: 'heal', name: 'Heal', cost: 1, description: 'Restore 30 HP to ally' },
    { id: 'blessing', name: 'Blessing', cost: 2, description: 'Grant damage reduction' },
    { id: 'sanctuary', name: 'Sanctuary', cost: 3, description: 'Create safe zone' }
  ]
};

export const Warrior: Story = {
  args: {
    characterClass: warriorClass,
    isSelected: false,
    showAbilities: false,
    showAbilitiesOnHover: false,
  },
};

export const WarriorSelected: Story = {
  args: {
    characterClass: warriorClass,
    isSelected: true,
    showAbilities: false,
    showAbilitiesOnHover: false,
  },
};

export const WarriorWithAbilities: Story = {
  args: {
    characterClass: warriorClass,
    isSelected: false,
    showAbilities: true,
    showAbilitiesOnHover: false,
  },
};

export const WarriorHoverForAbilities: Story = {
  args: {
    characterClass: warriorClass,
    isSelected: false,
    showAbilities: false,
    showAbilitiesOnHover: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hover over the card to see abilities appear.',
      },
    },
  },
};

export const Ranger: Story = {
  args: {
    characterClass: rangerClass,
    isSelected: false,
  },
};

export const Mage: Story = {
  args: {
    characterClass: mageClass,
    isSelected: false,
  },
};

export const Cleric: Story = {
  args: {
    characterClass: clericClass,
    isSelected: false,
  },
};

export const AllClassesComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <ClassCard characterClass={warriorClass} onClick={() => {}} />
      <ClassCard characterClass={rangerClass} onClick={() => {}} />
      <ClassCard characterClass={mageClass} onClick={() => {}} />
      <ClassCard characterClass={clericClass} onClick={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A comparison view of all available character classes.',
      },
    },
  },
};