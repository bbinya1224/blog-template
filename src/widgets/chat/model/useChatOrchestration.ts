'use client';

import { useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  useChatStore,
  useChatHandlers,
  MESSAGES,
} from '@/features/chat-review';
import { useRecentReviews } from '@/entities/review';
import { useStepEntry } from './useStepEntry';
import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewTopic } from '@/features/chat-review';

interface UseChatOrchestrationParams {
  userEmail: string;
  existingStyleProfile: StyleProfile | null;
}

export function useChatOrchestration({
  userEmail,
  existingStyleProfile,
}: UseChatOrchestrationParams) {
  const orchestrationState = useChatStore(
    useShallow((s) => ({
      step: s.step,
      userName: s.userName,
      hasExistingStyle: s.hasExistingStyle,
      styleProfile: s.styleProfile,
      selectedTopic: s.selectedTopic,
    })),
  );
  const {
    messages,
    setStyleProfile,
    setHasExistingStyle,
    setSelectedTopic,
    setStep,
    setSubStep,
    addAssistantMessage,
  } = useChatStore(
    useShallow((s) => ({
      messages: s.messages,
      setStyleProfile: s.setStyleProfile,
      setHasExistingStyle: s.setHasExistingStyle,
      setSelectedTopic: s.setSelectedTopic,
      setStep: s.setStep,
      setSubStep: s.setSubStep,
      addAssistantMessage: s.addAssistantMessage,
    })),
  );

  // Prop → store 동기화 (prop 변경/삭제도 반영)
  useEffect(() => {
    setStyleProfile(existingStyleProfile);
    setHasExistingStyle(Boolean(existingStyleProfile));
  }, [existingStyleProfile, setStyleProfile, setHasExistingStyle]);

  const { reviews: recentReviews } = useRecentReviews(5);
  const {
    handleSendMessage,
    handleChoiceSelect,
    handlePlaceConfirmation,
    handleReviewAction,
    fetchSmartQuestions,
    consumeNextQuestion,
    generateReview,
    isProcessing,
  } = useChatHandlers({ userEmail });

  const { isInitializedRef } = useStepEntry({
    fetchSmartQuestions,
    consumeNextQuestion,
    generateReview,
  });

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (isInitializedRef.current) return;

      const categoryMessages: Record<string, string> = {
        restaurant: MESSAGES.categoryStart.restaurant,
        beauty: MESSAGES.categoryStart.beauty,
        book: MESSAGES.categoryStart.book,
      };

      const message = categoryMessages[categoryId];
      if (message) {
        isInitializedRef.current = true;
        setSelectedTopic(categoryId as ReviewTopic);
        setStep('info-gathering');
        setSubStep('place');
        addAssistantMessage(message, 'text');
      }
    },
    [setSelectedTopic, setStep, setSubStep, addAssistantMessage],
  );

  const state = {
    step: orchestrationState.step,
    userName: orchestrationState.userName,
    hasExistingStyle: orchestrationState.hasExistingStyle,
    styleProfile: orchestrationState.styleProfile,
    selectedTopic: orchestrationState.selectedTopic,
  };
  const inputPlaceholder = getInputPlaceholder(
    orchestrationState.step,
    messages.length === 0,
  );

  return {
    messages,
    state,
    isProcessing,
    inputPlaceholder,
    recentReviews,
    handleSendMessage,
    handleChoiceSelect,
    handlePlaceConfirmation,
    handleReviewAction,
    handleCategorySelect,
  };
}

function getInputPlaceholder(step: string, isInitial: boolean): string {
  if (isInitial) {
    return '리뷰를 작성하고 싶은 맛집을 알려주세요...';
  }
  const placeholders: Record<string, string> = {
    'style-setup': '블로그 URL 또는 내용을 입력해주세요',
    'smart-followup': '자유롭게 답변해주세요',
    'review-edit': '수정할 내용을 입력해주세요',
  };
  return placeholders[step] || '메시지를 입력해주세요';
}
