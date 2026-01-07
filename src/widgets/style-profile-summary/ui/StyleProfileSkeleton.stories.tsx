import type { Meta, StoryObj } from '@storybook/react';
import { StyleProfileSkeleton } from './StyleProfileSkeleton';

const meta = {
  title: 'Widgets/StyleProfileSummary/Skeleton',
  component: StyleProfileSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StyleProfileSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
