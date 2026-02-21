'use client';

import { useCallback, useRef } from 'react';
import type { ReviewPayload } from '@/shared/types/review';
import { apiPost } from '@/shared/api/httpClient';

export function useSmartFollowup() {
  const questionsRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  const fetchSmartQuestions = useCallback(
    async (
      collectedInfo: Partial<ReviewPayload>,
      selectedTopic: string
    ): Promise<string[]> => {
      try {
        const data = await apiPost<{ questions?: string[] }>(
          '/api/chat/smart-followup',
          { collectedInfo, selectedTopic },
        );
        const fetchedQuestions: string[] = data.questions || [];
        questionsRef.current = fetchedQuestions;
        indexRef.current = 0;
        return fetchedQuestions;
      } catch (error) {
        console.error('Smart followup fetch error:', error);
        questionsRef.current = [];
        indexRef.current = 0;
        return [];
      }
    },
    []
  );

  const consumeNextQuestion = useCallback((): string | null => {
    if (indexRef.current >= questionsRef.current.length) return null;
    const question = questionsRef.current[indexRef.current];
    indexRef.current += 1;
    return question;
  }, []);

  const getRemainingQuestions = useCallback((): string[] => {
    return questionsRef.current.slice(indexRef.current);
  }, []);

  return {
    fetchSmartQuestions,
    consumeNextQuestion,
    getRemainingQuestions,
  };
}
