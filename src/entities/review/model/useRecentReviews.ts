'use client';

import { useQuery } from '@tanstack/react-query';
import type { Review } from './review';
import { apiGet } from '@/shared/api/httpClient';

export function useRecentReviews(limit: number = 5) {
  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['reviews', 'recent', limit],
    queryFn: () =>
      apiGet<Review[]>('/api/reviews', {
        params: { limit: String(limit) },
      }),
  });

  return { reviews, isLoading, error };
}
