import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'success'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '시작하기',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '취소',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: '더보기',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: '삭제',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: '완료',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: '처리 중...',
  },
};

export const LoadingSecondary: Story = {
  args: {
    variant: 'secondary',
    isLoading: true,
    children: '저장 중...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: '비활성화',
  },
};

export const SmallSize: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: '작은 버튼',
  },
};

export const LargeSize: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: '큰 버튼',
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-4'>
        <Button variant='primary'>Primary</Button>
        <Button variant='secondary'>Secondary</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='danger'>Danger</Button>
        <Button variant='success'>Success</Button>
      </div>
      <div className='flex gap-4'>
        <Button variant='primary' isLoading>
          Loading Primary
        </Button>
        <Button variant='secondary' isLoading>
          Loading Secondary
        </Button>
        <Button variant='success' isLoading>
          Loading Success
        </Button>
      </div>
      <div className='flex gap-4'>
        <Button variant='primary' size='sm'>
          Small
        </Button>
        <Button variant='primary' size='md'>
          Medium
        </Button>
        <Button variant='primary' size='lg'>
          Large
        </Button>
      </div>
    </div>
  ),
};

