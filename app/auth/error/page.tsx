'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>로그인 실패</h1>

          <p className='text-gray-700 mb-6'>
            {error === 'AccessDenied'
              ? '이 계정은 서비스 이용 권한이 없습니다.'
              : '로그인 중 오류가 발생했습니다.'}
          </p>

          <div className='bg-yellow-50 border border-yellow-200 rounded p-4 mb-6'>
            <p className='text-sm text-gray-700'>
              서비스를 이용하려면 먼저 후원이 필요합니다.
            </p>
          </div>

          <div className='space-y-3'>
            <Link
              href='/'
              className='block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition'
            >
              홈으로 돌아가기
            </Link>

            <a
              href='https://www.buymeacoffee.com/bbinya'
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full flex justify-center hover:opacity-90 transition'
            >
              <img
                src='https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png'
                alt='Buy Me A Coffee'
                style={{ height: '60px', width: '217px' }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthErrorSkeleton() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8'>
        <div className='text-center space-y-6'>
          <Skeleton className='h-8 w-32 mx-auto' />
          <Skeleton className='h-6 w-full' />
          <Skeleton className='h-20 w-full rounded' />
          <div className='space-y-3'>
            <Skeleton className='h-10 w-full rounded' />
            <Skeleton className='h-16 w-full rounded' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorSkeleton />}>
      <AuthErrorContent />
    </Suspense>
  );
}
