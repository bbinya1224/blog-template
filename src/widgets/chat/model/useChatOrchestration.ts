'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from '@/features/chat-review/model/store';
import { useRecentReviews } from '@/entities/review';
import { useChatHandlers } from '@/features/chat-review/model/useChatHandlers';
import { createInitialMessage } from '@/features/chat-review/lib/conversation/conversationEngine';
import { createSummaryMessage } from '@/features/chat-review/lib/step-handlers';
import { MESSAGES } from '@/features/chat-review/constants/messages';
import { CHOICE_OPTIONS } from '@/features/chat-review/constants/choiceOptions';
import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewTopic, ConversationStep } from '@/features/chat-review/model/types';

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
  const setStyleProfile = useChatStore((s) => s.setStyleProfile);
  const setHasExistingStyle = useChatStore((s) => s.setHasExistingStyle);
  const setSelectedTopic = useChatStore((s) => s.setSelectedTopic);
  const setStep = useChatStore((s) => s.setStep);
  const setSubStep = useChatStore((s) => s.setSubStep);
  const isInitializedRef = useRef(false);
  const prevStepRef = useRef<ConversationStep | null>(null);

  const { reviews: recentReviews } = useRecentReviews(5);
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
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

  // Initialize existing style profile
  useEffect(() => {
    if (existingStyleProfile) {
      setStyleProfile(existingStyleProfile);
      setHasExistingStyle(true);
    }
  }, [existingStyleProfile, setStyleProfile, setHasExistingStyle]);

  // Reset initialized flag when conversation is reset
  // step change effect보다 먼저 선언하여 같은 렌더 사이클에서 ref가 먼저 초기화됨
  useEffect(() => {
    if (messages.length === 0) {
      isInitializedRef.current = false;
      prevStepRef.current = null;
    }
  }, [messages.length]);

  // Handle step changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (orchestrationState.step === prevStepRef.current) return;
    prevStepRef.current = orchestrationState.step;

    const handleStepChange = async () => {
      switch (orchestrationState.step) {
        case 'style-check':
          if (orchestrationState.hasExistingStyle && orchestrationState.styleProfile) {
            addMessage(createInitialMessage('style-check', orchestrationState));
          }
          break;
        case 'topic-select':
          addMessage(createInitialMessage('topic-select', orchestrationState));
          break;
        case 'info-gathering':
          if (!orchestrationState.subStep) {
            addMessage(createInitialMessage('info-gathering', orchestrationState));
          }
          break;
        case 'smart-followup': {
          try {
            const questions = await fetchSmartQuestions(
              orchestrationState.collectedInfo,
              orchestrationState.selectedTopic || 'restaurant',
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
          addMessage(createSummaryMessage(orchestrationState));
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

  const state = useChatStore(
    useShallow((s) => ({
      step: s.step,
      userName: s.userName,
      hasExistingStyle: s.hasExistingStyle,
      styleProfile: s.styleProfile,
      selectedTopic: s.selectedTopic,
    })),
  );
  const inputPlaceholder = getInputPlaceholder(orchestrationState.step, messages.length === 0);

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
