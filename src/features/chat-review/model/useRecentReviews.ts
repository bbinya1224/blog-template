'use client';

import { useQuery } from '@tanstack/react-query';
import type { Review } from '@/entities/review';
import { apiGet } from '@/shared/api/http-client';

export function useRecentReviews(limit: number = 5) {
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['reviews', 'recent', limit],
    queryFn: async () => {
      const data = await apiGet<Review[]>('/api/reviews');
      return data.slice(0, limit);
    },
  });

  return { reviews, isLoading, error };
}
