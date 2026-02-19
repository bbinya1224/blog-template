'use client';

import { cn } from '@/shared/lib/utils';
import type { StyleSummaryMetadata } from '@/entities/chat-message';

interface StyleSummaryCardProps {
  metadata: StyleSummaryMetadata;
  className?: string;
}

export function StyleSummaryCard({
  metadata,
  className,
}: StyleSummaryCardProps) {
  const styleItems = [
    { label: '문체', value: metadata.writingStyle },
    { label: '이모지', value: metadata.emojiUsage },
    { label: '문장 길이', value: metadata.sentenceLength },
    { label: '톤', value: metadata.tone },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl bg-linear-to-br from-stone-50 to-orange-50/30 p-5',
        'border border-stone-100',
        className,
      )}
    >
      {/* Header */}
      <div className='mb-4 flex items-center gap-2.5'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-orange-100'>
          <svg
            className='size-4 text-orange-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            />
          </svg>
        </div>
        <h4 className='font-medium text-stone-700'>나의 글쓰기 스타일</h4>
      </div>

      {/* Style attributes */}
      <div className='space-y-2.5'>
        {styleItems.map((item) => (
          <div key={item.label} className='flex items-start gap-3'>
            <span className='w-16 shrink-0 pt-0.5 text-xs text-stone-400'>
              {item.label}
            </span>
            <span className='text-sm/relaxed text-stone-600'>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Frequent expressions */}
      {metadata.frequentExpressions &&
        metadata.frequentExpressions.length > 0 && (
          <div className='mt-4 border-t border-stone-100/80 pt-4'>
            <p className='mb-2.5 text-xs text-stone-400'>자주 쓰는 표현</p>
            <div className='flex flex-wrap gap-2'>
              {metadata.frequentExpressions.map((expr, index) => (
                <span
                  key={`${expr}-${index}`}
                  className='rounded-full border border-stone-100 bg-white px-3 py-1.5 text-xs text-stone-500 shadow-sm'
                >
                  &ldquo;{expr}&rdquo;
                </span>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
