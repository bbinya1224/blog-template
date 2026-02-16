'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  conversationStateAtom,
  hasExistingStyleAtom,
  styleProfileAtom,
  selectedTopicAtom,
  stepAtom,
  subStepAtom,
} from './atoms';
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
  const state = useAtomValue(conversationStateAtom);
  const setStyleProfile = useSetAtom(styleProfileAtom);
  const setHasExistingStyle = useSetAtom(hasExistingStyleAtom);
  const setSelectedTopic = useSetAtom(selectedTopicAtom);
  const setStep = useSetAtom(stepAtom);
  const setSubStep = useSetAtom(subStepAtom);
  const [styleSetupContext, setStyleSetupContext] = useState<StyleSetupContext>(
    {},
  );
  const isInitializedRef = useRef(false);
  const prevStepRef = useRef<ConversationStep | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  // Handle step changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (state.step === prevStepRef.current) return;
    prevStepRef.current = state.step;
    const s = stateRef.current;

    const handleStepChange = async () => {
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
            '내용이 맞나요?',
            'choice',
            CHOICE_OPTIONS.confirmInfo,
          );
          break;
        case 'generating':
          await generateReview();
          break;
      }
    };

    handleStepChange();
  }, [
    state.step,
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

  const handleSendMessage = useCallback(
    (message: string) => {
      if (messages.length === 0 && !isInitializedRef.current) {
        handleCategorySelect('restaurant');
      }
      originalHandleSendMessage(message);
    },
    [messages.length, handleCategorySelect, originalHandleSendMessage],
  );

  const inputPlaceholder = getInputPlaceholder(
    state.step,
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
