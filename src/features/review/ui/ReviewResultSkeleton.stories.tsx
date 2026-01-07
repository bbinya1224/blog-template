import type { Meta, StoryObj } from '@storybook/react';
import { ReviewResultSkeleton } from './ReviewResultSkeleton';

const meta = {
  title: 'Features/Review/ReviewResultSkeleton',
  component: ReviewResultSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReviewResultSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
