import { Skeleton } from '@/shared/ui/Skeleton';

export function ReviewResultSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Title Placeholder */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>

      {/* Divider */}
      <div className='border-t border-gray-100' />

      {/* Content Blocks */}
      <div className='space-y-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-11/12' />
            <Skeleton className='h-4 w-full' />
          </div>
        ))}
      </div>

      {/* Action Buttons Placeholder */}
      <div className='flex gap-3 pt-4'>
        <Skeleton className='h-10 w-24 rounded-lg' />
        <Skeleton className='h-10 w-24 rounded-lg' />
      </div>
    </div>
  );
}
