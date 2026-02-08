import { Skeleton } from '@/shared/ui/Skeleton';

export function MainLayoutSkeleton() {
  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
          <div className='space-y-1'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-5 w-48' />
          </div>
          <Skeleton className='size-8  rounded-full' />
        </div>
      </header>

      <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-10 md:px-12'>
        <div className='mb-10 flex gap-3'>
          <Skeleton className='h-7 w-32' />
          <Skeleton className='h-7 w-32' />
          <Skeleton className='h-7 w-32' />
        </div>

        <div className='space-y-10'>
          <section className='space-y-4'>
            <Skeleton className='h-4 w-24' />
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
            <Skeleton className='mb-4 h-6 w-32' />
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
      </main>
    </div>
  );
}
