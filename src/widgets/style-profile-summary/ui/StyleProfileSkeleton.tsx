import { Skeleton } from '@/shared/ui/Skeleton';

export function StyleProfileSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='card-info'>
        <Skeleton className='mb-3 h-4 w-32' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
      </div>

      <div>
        <Skeleton className='mb-3 h-4 w-32' />
        <div className='flex flex-wrap gap-2'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-7 w-20 rounded-full' />
          ))}
        </div>
      </div>

      <div className='space-y-2'>
        <Skeleton className='h-4 w-40' />
      </div>

      <div className='card-success flex items-center justify-between'>
        <div className='space-y-1'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-4 w-48' />
        </div>
        <Skeleton className='h-10 w-32 rounded-lg' />
      </div>
    </div>
  );
}
