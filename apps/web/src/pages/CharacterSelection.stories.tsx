import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { CharacterSelection } from './CharacterSelection';

// Mock react-router-dom hooks for Storybook
const MockRouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

const meta: Meta<typeof CharacterSelection> = {
  title: 'Pages/CharacterSelection',
  component: CharacterSelection,
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
  decorators: [
    (Story) => (
      <MockRouterWrapper>
        <Story />
      </MockRouterWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock useParams to return a test game ID
export const Default: Story = {
  parameters: {
    mockData: [
      {
        url: '/character-select/ABC123',
        method: 'GET',
        status: 200,
        response: {},
      },
    ],
    docs: {
      description: {
        story: 'The character selection page as it appears when a player needs to choose their class.',
      },
    },
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Character selection page optimized for mobile devices. The layout adapts to smaller screens.',
      },
    },
  },
};

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Character selection page on tablet devices with responsive grid layout.',
      },
    },
  },
};