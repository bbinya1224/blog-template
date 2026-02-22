'use client';

import { useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { useTypingEffect, useStaggerReveal } from '@/shared/lib/hooks';
import type { StyleSummaryMetadata } from '../model/types';

const INITIAL_DELAY_MS = 700;
const ITEM_STAGGER_MS = 400;
const TAG_STAGGER_MS = 150;
const TYPING_SPEED = 18;

function TypingValue({ value, active }: { value: string; active: boolean }) {
  const { displayedText } = useTypingEffect(value, active, TYPING_SPEED);
  return <>{displayedText}</>;
}

interface StyleSummaryCardProps {
  metadata: StyleSummaryMetadata;
  enableTyping?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export function StyleSummaryCard({
  metadata,
  enableTyping = false,
  onAnimationComplete,
  className,
}: StyleSummaryCardProps) {
  const styleItems = [
    { label: '문체', value: metadata.writingStyle },
    { label: '이모지', value: metadata.emojiUsage },
    { label: '문장 길이', value: metadata.sentenceLength },
    { label: '톤', value: metadata.tone },
  ];

  const hasExpressions =
    metadata.frequentExpressions && metadata.frequentExpressions.length > 0;
  const tagCount = metadata.frequentExpressions?.length ?? 0;

  // step 1: header, steps 2..5: style items, step 6: expressions
  const totalSteps = 1 + styleItems.length + (hasExpressions ? 1 : 0);
  const revealStep = useStaggerReveal(totalSteps, enableTyping, {
    delayMs: INITIAL_DELAY_MS,
    staggerMs: ITEM_STAGGER_MS,
  });

  const headerVisible = revealStep >= 1;
  const expressionsRevealed = revealStep >= 1 + styleItems.length + 1;

  const visibleTags = useStaggerReveal(
    tagCount,
    enableTyping && expressionsRevealed,
    {
      staggerMs: TAG_STAGGER_MS,
      showAllWhenDisabled: !enableTyping,
    },
  );

  const allItemsRevealed = revealStep >= totalSteps;
  const allTagsRevealed = !hasExpressions || visibleTags >= tagCount;
  useEffect(() => {
    if ((!enableTyping || (allItemsRevealed && allTagsRevealed)) && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [enableTyping, allItemsRevealed, allTagsRevealed, onAnimationComplete]);

  return (
    <div className={cn('rounded-2xl p-5', className)}>
      {/* Header */}
      <div
        className={cn(
          'mb-4 flex items-center gap-2.5 transition-opacity duration-300',
          enableTyping && !headerVisible ? 'opacity-0' : 'opacity-100',
        )}
      >
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
        <h4 className='font-medium text-stone-700'>
          {enableTyping ? (
            headerVisible ? (
              <TypingValue value='나의 글쓰기 스타일' active />
            ) : null
          ) : (
            '나의 글쓰기 스타일'
          )}
        </h4>
      </div>

      {/* Style attributes */}
      <div className='space-y-2.5'>
        {styleItems.map((item, index) => {
          const itemVisible = revealStep >= index + 2;
          return (
            <div
              key={item.label}
              className={cn(
                'flex items-start gap-3 transition-opacity duration-300',
                itemVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <span className='w-16 shrink-0 pt-0.5 text-xs text-stone-400'>
                {item.label}
              </span>
              <span className='text-sm/relaxed text-stone-600'>
                {enableTyping ? (
                  itemVisible ? <TypingValue value={item.value} active /> : null
                ) : (
                  item.value
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Frequent expressions */}
      {hasExpressions && (
        <div
          className={cn(
            'mt-4 border-t border-stone-100/80 pt-4 transition-opacity duration-300',
            expressionsRevealed ? 'opacity-100' : 'opacity-0',
          )}
        >
          <p className='mb-2.5 text-xs text-stone-400'>자주 쓰는 표현</p>
          <div className='flex flex-wrap gap-2'>
            {metadata.frequentExpressions!.map((expr, index) => (
              <span
                key={`${expr}-${index}`}
                className={cn(
                  'rounded-full border border-stone-100 bg-white px-3 py-1.5 text-xs text-stone-500 shadow-sm',
                  'transition-opacity duration-200',
                  index < visibleTags ? 'opacity-100' : 'opacity-0',
                )}
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
