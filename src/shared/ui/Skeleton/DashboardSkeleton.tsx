import { Skeleton } from '@/shared/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className='space-y-10'>
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-24' />
        </div>

        <div className='space-y-3'>
          <Skeleton className='h-10 w-80' />
          <Skeleton className='h-6 w-96' />
        </div>
      </section>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'
          >
            <Skeleton className='mb-4 h-6 w-48' />
            <Skeleton className='mb-2 h-4 w-full' />
            <Skeleton className='mb-2 h-4 w-full' />
            <Skeleton className='mb-4 h-4 w-3/4' />
            <Skeleton className='mt-4 h-10 w-full rounded-lg' />
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-6 w-32' />
        </div>
        <Skeleton className='mb-3 h-4 w-40' />
        <div className='space-y-2 pl-5'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='mt-2 h-4 w-full' />
          <Skeleton className='h-4 w-4/5' />
        </div>
      </div>
    </div>
  );
}
