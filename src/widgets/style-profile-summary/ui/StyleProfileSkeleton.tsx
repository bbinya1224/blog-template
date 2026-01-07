import { Skeleton } from '@/shared/ui/Skeleton';

export function StyleProfileSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Chips */}
      <div className='flex gap-2'>
        <Skeleton className='h-6 w-16 rounded-full' />
        <Skeleton className='h-6 w-20 rounded-full' />
      </div>

      {/* Main Stats Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='rounded-xl border border-gray-100 bg-white p-4'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='rounded-xl border border-gray-100 bg-white p-4'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-8 w-32' />
        </div>
      </div>

      {/* Description Text */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
        <Skeleton className='h-4 w-4/6' />
      </div>

      {/* Chart/Visual Placeholder */}
      <div className='flex h-40 items-center justify-center rounded-xl bg-gray-50'>
        <Skeleton className='h-32 w-32 rounded-full' />
      </div>
    </div>
  );
}
