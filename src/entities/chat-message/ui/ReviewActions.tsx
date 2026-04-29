'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Copy, Sparkles, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';

interface Props {
  review: string;
  onAction?: (action: 'complete' | 'edit') => void;
}

type CopyState = 'idle' | 'copied' | 'failed';

export function ReviewActions({ review, onAction }: Props) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        {review.length.toLocaleString()}자
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
            <Check className='size-3.5' />
            <span>복사됨</span>
          </>
        ) : copyState === 'failed' ? (
          <span>복사 실패</span>
        ) : (
          <>
            <Copy className='size-3.5' />
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
              'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium',
              'bg-linear-to-r from-orange-400 to-orange-500 text-white',
              'shadow-sm shadow-orange-200/50',
              'hover:shadow-md hover:shadow-orange-200/70',
              'active:scale-[0.98]',
              'transition-all duration-200',
            )}
          >
            <Sparkles className='size-3.5' />
            <span>완벽해요</span>
          </Button>
          <Button
            variant='unstyled'
            onClick={() => onAction('edit')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium',
              'border border-stone-200 bg-white text-stone-600',
              'hover:border-stone-300 hover:bg-stone-50',
              'active:scale-[0.98]',
              'transition-all duration-200',
            )}
          >
            <Pencil className='size-3.5' />
            <span>수정할래요</span>
          </Button>
        </>
      )}
    </div>
  );
}
