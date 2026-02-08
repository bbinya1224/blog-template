import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSkeleton } from './DashboardSkeleton';

const meta = {
  title: 'Skeleton/Dashboard',
  component: DashboardSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock StepIndicator for Storybook (avoiding Next.js routing dependencies)
const MockStepIndicator = () => (
  <ol className='flex flex-wrap gap-3 text-sm font-medium text-gray-500'>
    <li className='flex items-center text-sm'>
      <span className='mr-2 inline-flex size-7 items-center justify-center rounded-full bg-(--primary) text-xs font-semibold text-white'>
        1
      </span>
      <span className='text-gray-900'>스타일 분석</span>
      <span className='mx-3 text-gray-300'>—</span>
    </li>
    <li className='flex items-center text-sm'>
      <span className='mr-2 inline-flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500'>
        2
      </span>
      <span>리뷰 생성</span>
      <span className='mx-3 text-gray-300'>—</span>
    </li>
    <li className='flex items-center text-sm'>
      <span className='mr-2 inline-flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500'>
        3
      </span>
      <span>수정/보관</span>
    </li>
  </ol>
);

export const Default: Story = {};

export const WithLayout: Story = {
  render: () => (
    <div className='min-h-screen bg-(--background)'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
          <div>
            <p className='text-xs font-semibold tracking-[0.2em] text-(--primary) uppercase'>
              오롯이
            </p>
            <p className='text-lg font-semibold text-gray-900'>
              당신의 경험을 가장 풍부하게 기록하는 도구
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='size-8 rounded-full bg-gray-300' />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto w-full max-w-5xl px-6 pt-10 pb-16 md:px-12'>
        <div className='mb-10'>
          <MockStepIndicator />
        </div>
        <DashboardSkeleton />
      </main>
    </div>
  ),
};

export const SkeletonOnly: Story = {
  render: () => (
    <div className='bg-(--background) p-6'>
      <DashboardSkeleton />
    </div>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div className='space-y-8 p-6'>
      <div>
        <h2 className='mb-4 text-xl font-bold'>
          Full Layout Context (권장 - 실제 사용 환경)
        </h2>
        <div className='overflow-hidden rounded-lg border'>
          <div className='min-h-screen bg-(--background)'>
            <header className='border-b border-gray-200 bg-white'>
              <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
                <div>
                  <p className='text-xs font-semibold tracking-[0.2em] text-(--primary) uppercase'>
                    오롯이
                  </p>
                  <p className='text-lg font-semibold text-gray-900'>
                    당신의 경험을 가장 풍부하게 기록하는 도구
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='size-8 rounded-full bg-gray-300' />
                </div>
              </div>
            </header>
            <main className='mx-auto w-full max-w-5xl px-6 pt-10 pb-16 md:px-12'>
              <div className='mb-10'>
                <MockStepIndicator />
              </div>
              <DashboardSkeleton />
            </main>
          </div>
        </div>
      </div>

      <div className='border-t pt-8'>
        <h2 className='mb-4 text-xl font-bold'>Skeleton Only (참고용)</h2>
        <div className='rounded-lg border bg-(--background) p-6'>
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  ),
};
