import type { Meta, StoryObj } from '@storybook/react';
import { DynamicMessage } from './DynamicMessage';

const meta = {
  title: 'Shared/UI/DynamicMessage',
  component: DynamicMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    messages: { control: 'object' },
    interval: { control: 'number' },
  },
} satisfies Meta<typeof DynamicMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    messages: [
      '첫 번째 메시지입니다... 1️⃣',
      '두 번째 메시지입니다... 2️⃣',
      '세 번째 메시지입니다... 3️⃣',
      '마지막 메시지입니다! 🚀',
    ],
    interval: 2000,
  },
};

export const Analyzing: Story = {
  args: {
    messages: [
      '블로그의 최근 글을 읽어오고 있어요 📖',
      '작성된 글의 스타일과 톤을 분석 중입니다 🧐',
      '거의 다 분석했어요! 조금만 더 기다려주세요 🚀',
    ],
    interval: 3000,
  },
};

export const Generating: Story = {
  args: {
    messages: [
      '작성해주신 초안을 읽고 있어요... 👀',
      '블로그 스타일에 맞춰 톤을 조정 중입니다... 🎨',
      '매력적인 문장을 다듬고 있어요... ✨',
      '거의 다 됐어요! 🚀',
    ],
    interval: 3000,
  },
};
