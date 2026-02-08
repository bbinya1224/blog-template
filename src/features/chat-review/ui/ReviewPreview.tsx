'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import type { ReviewPreviewMetadata } from '@/entities/chat-message';

interface ReviewPreviewProps {
  metadata: ReviewPreviewMetadata;
  onAction?: (action: 'complete' | 'edit') => void;
  className?: string;
}

export function ReviewPreview({ metadata, onAction, className }: ReviewPreviewProps) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(metadata.review);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 실패 시 무시
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 border-stone-100 overflow-hidden',
        'shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 bg-linear-to-r from-stone-50 to-orange-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-stone-700">완성된 리뷰</h4>
              <p className="text-xs text-stone-400">
                {metadata.characterCount.toLocaleString()}자
              </p>
            </div>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
              'transition-all duration-200',
              copied
                ? 'bg-green-50 text-green-600'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            )}
          >
            {copied ? (
              <>
                <svg className="size-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>복사됨</span>
              </>
            ) : (
              <>
                <svg className="size-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review content */}
      <div className="p-5 max-h-64 sm:max-h-80 overflow-y-auto">
        <p className="text-stone-600 whitespace-pre-wrap leading-relaxed text-sm">
          {metadata.review}
        </p>
      </div>

      {/* Action buttons */}
      {onAction && (
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex gap-3">
          <button
            onClick={() => onAction('complete')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl text-sm font-medium',
              'bg-linear-to-r from-orange-400 to-orange-500 text-white',
              'shadow-md shadow-orange-200/50',
              'hover:shadow-lg hover:shadow-orange-200/70',
              'active:scale-[0.98]',
              'transition-all duration-200'
            )}
          >
            완벽해요!
          </button>
          <button
            onClick={() => onAction('edit')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl text-sm font-medium',
              'bg-white text-stone-600 border-2 border-stone-100',
              'hover:border-stone-200 hover:bg-stone-50',
              'active:scale-[0.98]',
              'transition-all duration-200'
            )}
          >
            수정할래요
          </button>
        </div>
      )}
    </div>
  );
}
