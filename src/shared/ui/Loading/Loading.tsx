import { cn } from '@/shared/lib/utils';

export interface LoadingProps {
  isVisible?: boolean;
  message?: string;
  variant?: 'fullscreen' | 'overlay' | 'inline';
  className?: string;
}

export function Loading({
  isVisible = true,
  message,
  variant = 'overlay',
  className,
}: LoadingProps) {
  if (!isVisible) return null;

  const containerClasses = cn(
    'flex flex-col items-center justify-center transition-opacity duration-200',
    variant === 'fullscreen' && 'fixed inset-0 z-50 bg-white',
    variant === 'overlay' && 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
    variant === 'inline' && 'w-full py-8',
    className
  );

  const innerContentClasses = cn(
    'flex flex-col items-center gap-6',
    variant === 'overlay' &&
      'rounded-2xl bg-white p-10 shadow-2xl animate-in zoom-in-95'
  );

  return (
    <div className={containerClasses}>
      <div className={innerContentClasses}>
        <div className='relative h-16 w-16'>
          <div className='absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-25'></div>
          <div className='relative flex h-full w-full items-center justify-center rounded-full bg-blue-100'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          </div>
        </div>

        <div className='text-center space-y-2'>
          {variant !== 'inline' && (
            <p className='text-xl font-bold text-gray-900'>
              잠시만 기다려주세요
            </p>
          )}

          {message && (
            <p className='text-base font-medium text-blue-600 animate-pulse'>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

