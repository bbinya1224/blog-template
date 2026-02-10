'use client';

import { useState, useCallback } from 'react';
import type { ReviewPayload } from '@/shared/types/review';

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

  const fetchSmartQuestions = useCallback(
    async (
      collectedInfo: Partial<ReviewPayload>,
      selectedTopic: string
    ): Promise<string[]> => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat/smart-followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectedInfo, selectedTopic }),
        });

        const data = await response.json();
        const fetchedQuestions: string[] = data.questions || [];
        setQuestions(fetchedQuestions);
        setCurrentQuestionIndex(0);
        return fetchedQuestions;
      } catch (error) {
        console.error('Smart followup fetch error:', error);
        setQuestions([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const consumeNextQuestion = useCallback((): string | null => {
    if (currentQuestionIndex >= questions.length) return null;
    const question = questions[currentQuestionIndex];
    setCurrentQuestionIndex((prev) => prev + 1);
    return question;
  }, [questions, currentQuestionIndex]);

  const getRemainingQuestions = useCallback((): string[] => {
    return questions.slice(currentQuestionIndex + 1);
  }, [questions, currentQuestionIndex]);

  const reset = useCallback(() => {
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
