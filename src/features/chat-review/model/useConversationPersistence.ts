'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { filterConversationMessages } from '../lib/filterConversationMessages';
import { apiPut } from '@/shared/api/httpClient';

export function useConversationPersistence() {
  return useCallback(() => {
    const { savedReviewId, generatedReview, messages } =
      useChatStore.getState();
    if (savedReviewId && generatedReview) {
      const conversation = filterConversationMessages(messages);
      apiPut(`/api/reviews/${encodeURIComponent(savedReviewId)}`, {
        content: generatedReview,
        conversation,
      }).catch((err) => {
        console.error('대화 내역 저장 실패:', err);
      });
    }
  }, []);
}
