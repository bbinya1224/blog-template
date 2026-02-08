'use client';

import Link from 'next/link';
import { useRecentReviews } from '@/features/chat-review/model/use-recent-reviews';
import { formatReviewDate } from '@/shared/lib/utils';
import { useSidebar } from '../model/sidebar-context';

function getIsDesktop() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 768px)').matches;
}

export function SidebarReviewList() {
  const { reviews, isLoading } = useRecentReviews(20);
  const { isExpanded, collapse } = useSidebar();

  const handleClick = () => {
    if (!getIsDesktop()) collapse();
  };

  if (!isExpanded) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        <svg className="size-5  text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-3 py-2 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-stone-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-stone-400">아직 기록이 없어요</p>
      </div>
    );
  }

  return (
    <div className="px-2 py-1 space-y-0.5">
      {reviews.map((review) => (
        <Link
          key={review.id}
          href={`/reviews/${review.id}`}
          onClick={handleClick}
          className="block px-3 py-2.5 rounded-lg text-left hover:bg-stone-100 transition-colors group"
        >
          <p className="text-sm font-medium text-stone-700 truncate group-hover:text-(--primary) transition-colors">
            {review.storeName || '맛집 리뷰'}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {formatReviewDate(review.date)}
          </p>
        </Link>
      ))}
    </div>
  );
}
