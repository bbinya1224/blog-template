'use client';

import { useState, useEffect } from 'react';
import type { Review } from '@/entities/review';

export function useRecentReviews(limit: number = 5) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        if (!cancelled) {
          setReviews(data.slice(0, limit));
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { reviews, isLoading, error };
}
