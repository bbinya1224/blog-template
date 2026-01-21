import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSkeleton } from './DashboardSkeleton';
import { StepIndicator } from '@/shared/ui/StepIndicator';

const meta = {
  title: 'Shared/Skeleton/DashboardSkeleton',
  component: DashboardSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLayout: Story = {
  render: () => (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-500'>
              Blog Tone Lab
            </p>
            <p className='text-lg font-semibold text-gray-900'>
              블로그 톤 기반 리뷰 생성 도구
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='h-8 w-8 rounded-full bg-gray-300' />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-10 md:px-12'>
        <div className='mb-10'>
          <StepIndicator />
        </div>
        <DashboardSkeleton />
      </main>
    </div>
  ),
};

export const SkeletonOnly: Story = {
  render: () => (
    <div className='bg-slate-50 p-6'>
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
          <div className='min-h-screen bg-slate-50'>
            <header className='border-b border-gray-200 bg-white'>
              <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-500'>
                    Blog Tone Lab
                  </p>
                  <p className='text-lg font-semibold text-gray-900'>
                    블로그 톤 기반 리뷰 생성 도구
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='h-8 w-8 rounded-full bg-gray-300' />
                </div>
              </div>
            </header>
            <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-10 md:px-12'>
              <div className='mb-10'>
                <StepIndicator />
              </div>
              <DashboardSkeleton />
            </main>
          </div>
        </div>
      </div>

      <div className='border-t pt-8'>
        <h2 className='mb-4 text-xl font-bold'>Skeleton Only (참고용)</h2>
        <div className='rounded-lg border bg-slate-50 p-6'>
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  ),
};

