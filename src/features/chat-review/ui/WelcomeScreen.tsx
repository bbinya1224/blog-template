'use client';

import { cn, formatReviewDate } from '@/shared/lib/utils';
import type { Review } from '@/entities/review';
import Link from 'next/link';

interface WelcomeScreenProps {
  userName: string;
  recentReviews?: Review[];
  onStartChat: () => void;
  className?: string;
}

export function WelcomeScreen({
  userName,
  recentReviews = [],
  onStartChat,
  className,
}: WelcomeScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-dvh w-full',
        'md:max-w-3xl md:mx-auto',
        className
      )}
    >
      {/* Scrollable content area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Recent reviews - Card Grid (if exists) */}
        {recentReviews.length > 0 && (
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-stone-500">
                리뷰 보관함
              </h2>
              <Link
                href="/reviews"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                전체보기
              </Link>
            </div>

            {/* Horizontal scroll cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {recentReviews.slice(0, 6).map((review) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.id}`}
                  className={cn(
                    'group shrink-0 w-48 p-4',
                    'rounded-xl border border-stone-200',
                    'hover:border-orange-300 hover:shadow-md',
                    'transition-all duration-200'
                  )}
                >
                  <h3 className="text-sm font-semibold text-stone-800 mb-1 truncate group-hover:text-orange-600 transition-colors">
                    {review.storeName || '맛집 리뷰'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {formatReviewDate(review.date)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Center greeting - takes remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-stone-800 mb-2">
              {userName ? `${userName}님,` : '안녕하세요'}
            </h1>
            <p className="text-lg text-stone-400">
              오늘은 어떤 맛집을 기록해볼까요?
            </p>
          </div>
        </div>
      </div>

      {/* Fixed input area at bottom - same position as ChatContainer */}
      <div className="px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onStartChat}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3.5',
              'rounded-xl',
              'border border-stone-200',
              'hover:border-orange-300',
              'transition-all duration-200',
              'text-left'
            )}
          >
            <span className="text-stone-400">
              리뷰를 작성하고 싶은 맛집을 알려주세요...
            </span>
          </button>
          <p className="text-xs text-stone-300 text-center mt-2">
            클릭하여 시작
          </p>
        </div>
      </div>
    </div>
  );
}
