import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from './Loading';

const meta = {
  title: 'Shared/UI/Loading',
  component: Loading,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isVisible: { control: 'boolean' },
    message: { control: 'text' },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isVisible: true,
    message: '잠시만 기다려주세요...',
  },
};

export const Analyzing: Story = {
  args: {
    isVisible: true,
    message: '블로그 스타일을 분석 중입니다 🧐',
  },
};

export const Generating: Story = {
  args: {
    isVisible: true,
    message: '리뷰를 작성하고 있습니다 ✍️',
  },
};
