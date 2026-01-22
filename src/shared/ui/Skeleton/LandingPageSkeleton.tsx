import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

export function LandingPageSkeleton() {
  return (
    <div className='min-h-screen bg-white text-gray-900'>
      {/* Navigation Bar */}
      <nav className='fixed left-0 top-0 z-50 w-full border-b border-transparent bg-white/80 backdrop-blur-md'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-12'>
          <Skeleton className='h-7 w-32' />
          <div className='flex items-center gap-4'>
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-9 w-20 rounded-full' />
          </div>
        </div>
      </nav>

      <main className='pt-24'>
        {/* Hero Section */}
        <section className='relative overflow-hidden px-6 pb-20 pt-16 md:pt-32'>
          <div className='mx-auto max-w-4xl text-center'>
            <Skeleton className='mx-auto mb-6 h-20 w-full max-w-2xl md:h-28' />
            <Skeleton className='mx-auto mb-10 h-16 w-full max-w-2xl' />

            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Skeleton className='h-14 w-full rounded-2xl sm:w-64' />
              <Skeleton className='h-14 w-full rounded-2xl sm:w-72' />
            </div>

            <Skeleton className='mx-auto mt-6 h-5 w-48' />
          </div>
        </section>

        {/* Features Section */}
        <section className='bg-gray-50 px-6 py-24 md:py-32'>
          <div className='mx-auto max-w-5xl'>
            <div className='mb-16 md:text-center'>
              <Skeleton className='mx-auto mb-4 h-8 w-40 rounded-full' />
              <Skeleton className='mx-auto h-16 w-full max-w-xl md:h-20' />
            </div>

            <div className='grid gap-8 md:grid-cols-2'>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className='rounded-3xl bg-white p-8 shadow-sm md:p-12'
                >
                  <Skeleton className='mb-6 h-12 w-12 rounded-lg' />
                  <Skeleton className='mb-3 h-8 w-32' />
                  <div className='space-y-3'>
                    <Skeleton className='h-5 w-full' />
                    <Skeleton className='h-5 w-full' />
                    <Skeleton className='h-5 w-3/4' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className='px-6 py-24 md:py-32'>
          <div className='mx-auto max-w-5xl'>
            <Skeleton className='mx-auto mb-16 h-16 w-full max-w-md' />

            <div className='grid gap-6 md:grid-cols-3'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='rounded-3xl border border-gray-100 bg-white p-8'
                >
                  <Skeleton className='mb-6 h-14 w-14 rounded-full' />
                  <Skeleton className='mb-3 h-7 w-40' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-5/6' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className='bg-gray-900 px-6 py-24 md:py-32'>
          <div className='mx-auto max-w-4xl text-center'>
            <Skeleton className='mx-auto mb-6 h-12 w-80 bg-gray-700' />
            <Skeleton className='mx-auto mb-12 h-8 w-96 bg-gray-700' />

            <div className='relative mx-auto max-w-md overflow-hidden rounded-3xl bg-gray-800 p-10 shadow-2xl'>
              <Skeleton className='mx-auto mb-6 h-16 w-32 bg-gray-700' />
              <div className='mb-10 space-y-4'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-6 w-full bg-gray-700' />
                ))}
              </div>
              <Skeleton className='h-14 w-full rounded-xl bg-gray-700' />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-gray-100 bg-white py-12'>
        <div className='container mx-auto px-6 text-center'>
          <Skeleton className='mx-auto mb-2 h-4 w-64' />
          <Skeleton className='mx-auto h-4 w-32' />
        </div>
      </footer>
    </div>
  );
}
