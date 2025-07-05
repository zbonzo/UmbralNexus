import type { Meta, StoryObj } from '@storybook/react';
import { CharacterSelect } from './CharacterSelect';

const meta: Meta<typeof CharacterSelect> = {
  title: 'Game/CharacterSelect',
  component: CharacterSelect,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    selectedClass: {
      control: 'select',
      options: ['warrior', 'ranger', 'mage', 'cleric'],
      description: 'Initially selected character class',
    },
    onSelectClass: { action: 'class-selected' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
};

export const WithWarriorSelected: Story = {
  args: {
    selectedClass: 'warrior',
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
};

export const WithRangerSelected: Story = {
  args: {
    selectedClass: 'ranger',
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
};

export const WithMageSelected: Story = {
  args: {
    selectedClass: 'mage',
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
};

export const WithClericSelected: Story = {
  args: {
    selectedClass: 'cleric',
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
};

export const Interactive: Story = {
  args: {
    onSelectClass: (classId: string) => {
      console.log('Selected class:', classId);
      // In a real app, this would update the selected state
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on any character class to see the selection behavior. Check the Actions panel to see the events.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Character selection optimized for mobile devices. Cards stack vertically on smaller screens.',
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    onSelectClass: (classId: string) => console.log('Selected:', classId),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Character selection on tablet devices showing 2-column layout.',
      },
    },
  },
};