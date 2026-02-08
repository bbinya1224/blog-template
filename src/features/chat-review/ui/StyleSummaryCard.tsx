'use client';

import { cn } from '@/shared/lib/utils';
import type { StyleSummaryMetadata } from '@/entities/chat-message';

interface StyleSummaryCardProps {
  metadata: StyleSummaryMetadata;
  className?: string;
}

export function StyleSummaryCard({ metadata, className }: StyleSummaryCardProps) {
  const styleItems = [
    { label: '문체', value: metadata.writingStyle },
    { label: '이모지', value: metadata.emojiUsage },
    { label: '문장 길이', value: metadata.sentenceLength },
    { label: '톤', value: metadata.tone },
  ];

  return (
    <div
      className={cn(
        'bg-linear-to-br from-stone-50 to-orange-50/30 rounded-2xl p-5',
        'border border-stone-100',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="size-8  rounded-lg bg-orange-100 flex items-center justify-center">
          <svg
            className="size-4  text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <h4 className="font-medium text-stone-700">나의 글쓰기 스타일</h4>
      </div>

      {/* Style attributes */}
      <div className="space-y-2.5">
        {styleItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <span className="text-xs text-stone-400 w-16 shrink-0 pt-0.5">
              {item.label}
            </span>
            <span className="text-sm text-stone-600 leading-relaxed">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Frequent expressions */}
      {metadata.frequentExpressions && metadata.frequentExpressions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-100/80">
          <p className="text-xs text-stone-400 mb-2.5">자주 쓰는 표현</p>
          <div className="flex flex-wrap gap-2">
            {metadata.frequentExpressions.map((expr, index) => (
              <span
                key={`${expr}-${index}`}
                className="text-xs bg-white text-stone-500 px-3 py-1.5 rounded-full border border-stone-100 shadow-sm"
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
