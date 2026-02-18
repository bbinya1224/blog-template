'use client';

import { useState, useCallback, useRef } from 'react';
import type { ReviewPayload } from '@/shared/types/review';
import { apiPost } from '@/shared/api/http-client';

interface UseSmartFollowupReturn {
  questions: string[];
  currentQuestionIndex: number;
  isLoading: boolean;
  fetchSmartQuestions: (
    collectedInfo: Partial<ReviewPayload>,
    selectedTopic: string
  ) => Promise<string[]>;
  consumeNextQuestion: () => string | null;
  getRemainingQuestions: () => string[];
  reset: () => void;
}

export function useSmartFollowup(): UseSmartFollowupReturn {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const questionsRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  const fetchSmartQuestions = useCallback(
    async (
      collectedInfo: Partial<ReviewPayload>,
      selectedTopic: string
    ): Promise<string[]> => {
      setIsLoading(true);
      try {
        const data = await apiPost<{ questions?: string[] }>(
          '/api/chat/smart-followup',
          { collectedInfo, selectedTopic },
        );
        const fetchedQuestions: string[] = data.questions || [];
        questionsRef.current = fetchedQuestions;
        indexRef.current = 0;
        setQuestions(fetchedQuestions);
        setCurrentQuestionIndex(0);
        return fetchedQuestions;
      } catch (error) {
        console.error('Smart followup fetch error:', error);
        questionsRef.current = [];
        indexRef.current = 0;
        setQuestions([]);
        setCurrentQuestionIndex(0);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const consumeNextQuestion = useCallback((): string | null => {
    if (indexRef.current >= questionsRef.current.length) return null;
    const question = questionsRef.current[indexRef.current];
    indexRef.current += 1;
    setCurrentQuestionIndex(indexRef.current);
    return question;
  }, []);

  const getRemainingQuestions = useCallback((): string[] => {
    return questionsRef.current.slice(indexRef.current);
  }, []);

  const reset = useCallback(() => {
    questionsRef.current = [];
    indexRef.current = 0;
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setIsLoading(false);
  }, []);

  return {
    questions,
    currentQuestionIndex,
    isLoading,
    fetchSmartQuestions,
    consumeNextQuestion,
    getRemainingQuestions,
    reset,
  };
}
