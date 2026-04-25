'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';

interface Props {
  review: string;
  characterCount: number;
  onAction?: (action: 'complete' | 'edit') => void;
}

type CopyState = 'idle' | 'copied' | 'failed';

export function ReviewActions({ review, characterCount, onAction }: Props) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(review);
      setCopyState('copied');
    } catch {
      console.warn('[ReviewActions] 클립보드 복사 실패');
      setCopyState('failed');
    }
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopyState('idle'), 2000);
  };

  return (
    <div className='animate-fade-in flex flex-wrap items-center gap-2 pt-3'>
      <span className='text-xs text-stone-400'>
        {characterCount.toLocaleString()}자
      </span>

      <Button
        variant='unstyled'
        onClick={handleCopy}
        className={cn(
          'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs',
          'transition-all duration-200',
          copyState === 'copied' && 'bg-green-50 text-green-600',
          copyState === 'failed' && 'bg-red-50 text-red-500',
          copyState === 'idle' && 'bg-stone-100 text-stone-500 hover:bg-stone-200',
        )}
      >
        {copyState === 'copied' ? (
          <>
            <svg
              className='size-3.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <span>복사됨</span>
          </>
        ) : copyState === 'failed' ? (
          <span>복사 실패</span>
        ) : (
          <>
            <svg
              className='size-3.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z'
              />
            </svg>
            <span>복사</span>
          </>
        )}
      </Button>

      {onAction && (
        <>
          <Button
            variant='unstyled'
            onClick={() => onAction('complete')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              'bg-linear-to-r from-orange-400 to-orange-500 text-white',
              'shadow-sm shadow-orange-200/50',
              'hover:shadow-md hover:shadow-orange-200/70',
              'active:scale-[0.98]',
              'transition-all duration-200',
            )}
          >
            ✨ 완벽해요
          </Button>
          <Button
            variant='unstyled'
            onClick={() => onAction('edit')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              'border border-stone-200 bg-white text-stone-600',
              'hover:border-stone-300 hover:bg-stone-50',
              'active:scale-[0.98]',
              'transition-all duration-200',
            )}
          >
            ✏️ 수정할래요
          </Button>
        </>
      )}
    </div>
  );
}
