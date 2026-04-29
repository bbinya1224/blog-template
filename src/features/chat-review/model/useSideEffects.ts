'use client';

import { useCallback } from 'react';
import { useBlogAnalysis } from './useBlogAnalysis';
import { usePlaceSearch } from './usePlaceSearch';
import { useReviewGeneration } from './useReviewGeneration';
import { useConversation } from './useConversation';
import type { SideEffect } from './types';

export function useSideEffects(userName: string | null) {
  const { analyzeBlogUrl } = useBlogAnalysis(userName);
  const { searchPlace } = usePlaceSearch();
  const { editReview, generateReview } = useReviewGeneration();
  const { parseConversation } = useConversation();

  const executeSideEffect = useCallback(
    async (sideEffect: SideEffect): Promise<boolean> => {
      switch (sideEffect.type) {
        case 'blog-analysis':
          await analyzeBlogUrl(sideEffect.url);
          return true;
        case 'place-search':
          await searchPlace(sideEffect.query);
          return true;
        case 'edit-review':
          await editReview(sideEffect.request);
          return true;
        case 'parse-conversation':
          await parseConversation(sideEffect.userMessage);
          return true;
        case 'generate-review':
          await generateReview();
          return true;
        case 'none':
          return false;
      }
    },
    [analyzeBlogUrl, searchPlace, editReview, parseConversation, generateReview],
  );

  return { executeSideEffect, generateReview };
}
