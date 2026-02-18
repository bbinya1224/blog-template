'use client';

import { useQuery } from '@tanstack/react-query';
import type { Review } from '@/entities/review';
import { apiGet } from '@/shared/api/httpClient';

export function useRecentReviews(limit: number = 5) {
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['reviews', 'recent'],
    queryFn: () => apiGet<Review[]>('/api/reviews'),
    select: (data) => data.slice(0, limit),
  });

  return { reviews, isLoading, error };
}
