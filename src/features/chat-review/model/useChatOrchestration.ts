'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from './store';
import { useRecentReviews } from './useRecentReviews';
import { useChatMessages } from './useChatMessages';
import { useReviewGeneration } from './useReviewGeneration';
import { useChatHandlers } from './useChatHandlers';
import { createInitialMessage } from '../lib/conversationEngine';
import { createSummaryMessage } from '../lib/step-handlers';
import { MESSAGES, CHOICE_OPTIONS } from '../constants/messages';
import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewTopic, ConversationStep } from './types';
import type { StyleSetupContext } from '../lib/step-handlers';

interface UseChatOrchestrationParams {
  userEmail: string;
  existingStyleProfile: StyleProfile | null;
}

export function useChatOrchestration({
  userEmail,
  existingStyleProfile,
}: UseChatOrchestrationParams) {
  const step = useChatStore((s) => s.step);
  const setStyleProfile = useChatStore((s) => s.setStyleProfile);
  const setHasExistingStyle = useChatStore((s) => s.setHasExistingStyle);
  const setSelectedTopic = useChatStore((s) => s.setSelectedTopic);
  const setStep = useChatStore((s) => s.setStep);
  const setSubStep = useChatStore((s) => s.setSubStep);
  const [styleSetupContext, setStyleSetupContext] = useState<StyleSetupContext>(
    {},
  );
  const isInitializedRef = useRef(false);
  const prevStepRef = useRef<ConversationStep | null>(null);

  const { reviews: recentReviews } = useRecentReviews(5);
  const { messages, addMessage, addAssistantMessage } = useChatMessages();
  const { generateReview } = useReviewGeneration({ userEmail });
  const {
    handleSendMessage: originalHandleSendMessage,
    handleChoiceSelect,
    handlePlaceConfirmation,
    handleReviewAction,
    fetchSmartQuestions,
    consumeNextQuestion,
    isProcessing,
  } = useChatHandlers({ userEmail, styleSetupContext, setStyleSetupContext });

  // Initialize existing style profile
  useEffect(() => {
    if (existingStyleProfile) {
      setStyleProfile(existingStyleProfile);
      setHasExistingStyle(true);
    }
  }, [existingStyleProfile, setStyleProfile, setHasExistingStyle]);

  // Handle step changes — getState()로 항상 최신 상태 접근 (stateRef 제거)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (step === prevStepRef.current) return;
    prevStepRef.current = step;

    const handleStepChange = async () => {
      const s = useChatStore.getState();

      switch (s.step) {
        case 'style-check':
          if (s.hasExistingStyle && s.styleProfile) {
            addMessage(createInitialMessage('style-check', s));
          }
          break;
        case 'topic-select':
          addMessage(createInitialMessage('topic-select', s));
          break;
        case 'info-gathering':
          if (!s.subStep) {
            addMessage(createInitialMessage('info-gathering', s));
          }
          break;
        case 'smart-followup': {
          try {
            const questions = await fetchSmartQuestions(
              s.collectedInfo,
              s.selectedTopic || 'restaurant',
            );
            if (questions.length > 0) {
              const combined = `${MESSAGES.smartFollowup.intro}\n\n${questions[0]}`;
              addAssistantMessage(
                combined,
                'choice',
                CHOICE_OPTIONS.smartFollowupSkip,
              );
              consumeNextQuestion();
            } else {
              addAssistantMessage(MESSAGES.smartFollowup.error, 'text');
            }
          } catch {
            addAssistantMessage(MESSAGES.smartFollowup.error, 'text');
          }
          break;
        }
        case 'confirmation':
          addMessage(createSummaryMessage(s));
          addAssistantMessage(
            MESSAGES.confirmation.ask,
            'choice',
            CHOICE_OPTIONS.confirmInfo,
          );
          break;
        case 'generating':
          await generateReview();
          break;
      }
    };

    handleStepChange().catch((error) => {
      console.error('[useChatOrchestration] handleStepChange 에러:', error);
      addAssistantMessage(MESSAGES.error.unknown, 'text');
    });
  }, [
    step,
    addMessage,
    addAssistantMessage,
    fetchSmartQuestions,
    consumeNextQuestion,
    generateReview,
  ]);

  // Reset initialized flag when conversation is reset
  useEffect(() => {
    if (messages.length === 0) {
      isInitializedRef.current = false;
      prevStepRef.current = null;
    }
  }, [messages.length]);

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

  // handleCategorySelect가 store를 동기 업데이트하지만, useChatHandlers의 셀렉터는
  // 리렌더 후에야 최신 값을 반영하므로 queueMicrotask로 다음 마이크로태스크에서 호출
  const handleSendMessage = useCallback(
    (message: string) => {
      if (messages.length === 0 && !isInitializedRef.current) {
        handleCategorySelect('restaurant');
        queueMicrotask(() => originalHandleSendMessage(message));
        return;
      }
      originalHandleSendMessage(message);
    },
    [messages.length, handleCategorySelect, originalHandleSendMessage],
  );

  const state = useChatStore(
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
  const inputPlaceholder = getInputPlaceholder(step, messages.length === 0);

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
