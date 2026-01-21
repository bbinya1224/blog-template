import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from './Loading';

const meta = {
  title: 'Shared/UI/Loading',
  component: Loading,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{ height: '100vh', minHeight: '400px', transform: 'scale(1)' }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isVisible: { control: 'boolean' },
    message: { control: 'text' },
    variant: {
      control: 'radio',
      options: ['fullscreen', 'overlay', 'inline'],
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overlay: Story = {
  args: {
    variant: 'overlay',
    isVisible: true,
    message: '잠시만 기다려주세요...',
  },
};

export const Fullscreen: Story = {
  args: {
    variant: 'fullscreen',
    isVisible: true,
    message: '페이지를 불러오는 중입니다...',
  },
};

export const Inline: Story = {
  args: {
    variant: 'inline',
    isVisible: true,
    message: '데이터를 처리하고 있습니다...',
  },
  decorators: [
    (Story) => (
      <div className='border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
        <Story />
      </div>
    ),
  ],
};

export const Analyzing: Story = {
  args: {
    variant: 'overlay',
    isVisible: true,
    message: '블로그 스타일을 분석 중입니다 🧐',
  },
};

export const Generating: Story = {
  args: {
    variant: 'overlay',
    isVisible: true,
    message: '리뷰를 작성하고 있습니다 ✍️',
  },
};
