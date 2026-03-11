'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  useChatStore,
  useChatHandlers,
  FLOW_GRAPH,
  MESSAGES,
} from '@/features/chat-review';
import type { FlowEnterContext } from '@/features/chat-review';
import { useRecentReviews } from '@/entities/review';
import type { StyleProfile } from '@/entities/style-profile';
import type {
  ReviewTopic,
  ConversationStep,
} from '@/features/chat-review';

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
      subStep: s.subStep,
      userName: s.userName,
      hasExistingStyle: s.hasExistingStyle,
      styleProfile: s.styleProfile,
      selectedTopic: s.selectedTopic,
      collectedInfo: s.collectedInfo,
      generatedReview: s.generatedReview,
      sessionId: s.sessionId,
    })),
  );
  const {
    messages,
    setStyleProfile,
    setHasExistingStyle,
    setSelectedTopic,
    setStep,
    setSubStep,
    addMessage,
    addAssistantMessage,
  } = useChatStore(
    useShallow((s) => ({
      messages: s.messages,
      setStyleProfile: s.setStyleProfile,
      setHasExistingStyle: s.setHasExistingStyle,
      setSelectedTopic: s.setSelectedTopic,
      setStep: s.setStep,
      setSubStep: s.setSubStep,
      addMessage: s.addMessage,
      addAssistantMessage: s.addAssistantMessage,
    })),
  );
  const isInitializedRef = useRef(false);
  const prevStepRef = useRef<ConversationStep | null>(null);

  // Prop → store 동기화
  useEffect(() => {
    if (existingStyleProfile && !orchestrationState.hasExistingStyle) {
      setStyleProfile(existingStyleProfile);
      setHasExistingStyle(true);
    }
  }, [existingStyleProfile, orchestrationState.hasExistingStyle, setStyleProfile, setHasExistingStyle]);

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

  // Conversation flow — reset guard + step entry (onEnter)
  useEffect(() => {
    if (messages.length === 0) {
      isInitializedRef.current = false;
      prevStepRef.current = null;
      return;
    }

    if (!isInitializedRef.current) return;
    if (orchestrationState.step === prevStepRef.current) return;
    prevStepRef.current = orchestrationState.step;

    const node = FLOW_GRAPH[orchestrationState.step];
    if (!node?.onEnter) return;

    const stepAtEntry = orchestrationState.step;
    const ctx: FlowEnterContext = {
      state: orchestrationState,
      fetchSmartQuestions,
      consumeNextQuestion,
      generateReview,
    };

    const applyResult = (result: { messages: Parameters<typeof addMessage>[0][] }) => {
      if (useChatStore.getState().step !== stepAtEntry) return;
      result.messages.forEach((msg) => addMessage(msg));
    };

    try {
      const result = node.onEnter(ctx);
      if (result instanceof Promise) {
        result.then(applyResult).catch((error) => {
          if (useChatStore.getState().step !== stepAtEntry) return;
          console.error('[useChatOrchestration] onEnter 에러:', error);
          addAssistantMessage(MESSAGES.error.unknown, 'text');
        });
      } else {
        applyResult(result);
      }
    } catch (error) {
      if (useChatStore.getState().step !== stepAtEntry) return;
      console.error('[useChatOrchestration] onEnter 에러:', error);
      addAssistantMessage(MESSAGES.error.unknown, 'text');
    }
  }, [
    messages.length,
    orchestrationState,
    addMessage,
    addAssistantMessage,
    fetchSmartQuestions,
    consumeNextQuestion,
    generateReview,
  ]);

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
