export interface LoadingProps {
  isVisible?: boolean;
  message?: string;
}

export function Loading({ isVisible = true, message }: LoadingProps) {
  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity'>
      <div className='flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200'>
        <div className='relative h-16 w-16'>
          <div className='absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-25'></div>
          <div className='relative flex h-full w-full items-center justify-center rounded-full bg-blue-100'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          </div>
        </div>
        <div className='text-center'>
          <p className='text-xl font-bold text-gray-900 mb-2'>
            잠시만 기다려주세요
          </p>
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
