'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from './store';
import { useConversationPersistence } from './useConversationPersistence';
import { useSideEffects } from './useSideEffects';
import { useSmartFollowup } from './useSmartFollowup';
import {
  handleStyleSetup,
  handleStyleCheck,
  handleTopicSelect,
  handleInfoGathering,
  handleConfirmation,
  handleSmartFollowup,
  handleReviewEdit,
  handlePlaceConfirmed,
  type StepHandlerResult,
} from '../lib/step-handlers';
import { MESSAGES } from '../constants/messages';
import { isPlaceCardMessage } from '@/entities/chat-message';
import type { UserInput } from './types';

interface UseChatHandlersProps {
  userEmail: string;
}

export function useChatHandlers({ userEmail: _userEmail }: UseChatHandlersProps) {
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
  const styleSetupContext = useChatStore((s) => s.styleSetupContext);
  const isProcessing = useChatStore((s) => s.isProcessing);
  const setIsProcessing = useChatStore((s) => s.setIsProcessing);
  const dispatchActions = useChatStore((s) => s.dispatchActions);
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);

  const { executeSideEffect, generateReview } = useSideEffects(state.userName);
  const {
    fetchSmartQuestions,
    consumeNextQuestion,
    getRemainingQuestions,
  } = useSmartFollowup();
  const persistConversation = useConversationPersistence();

  const processMessage = useCallback(
    async (input: UserInput) => {
      let result: StepHandlerResult;

      switch (state.step) {
        case 'style-check':
          result = handleStyleCheck(input, state);
          break;

        case 'style-setup':
          result = handleStyleSetup(input, state, styleSetupContext);
          break;

        case 'topic-select':
          result = handleTopicSelect(input, state);
          break;

        case 'info-gathering':
          result = handleInfoGathering(input, state);
          break;

        case 'smart-followup': {
          const remaining = getRemainingQuestions();
          result = handleSmartFollowup(input, state, remaining);
          if (result.sideEffect.type !== 'skip-followup' && remaining.length > 0) {
            consumeNextQuestion();
          }
          break;
        }

        case 'confirmation':
          result = handleConfirmation(input, state);
          break;

        case 'review-edit':
          result = handleReviewEdit(input, state);
          break;

        default:
          result = { messages: [], actions: [], sideEffect: { type: 'none' } };
      }

      result.messages.forEach((msg) => addMessage(msg));

      const hadAsyncEffect = await executeSideEffect(result.sideEffect);
      if (hadAsyncEffect) {
        dispatchActions(result.actions);
        return null;
      }

      return { actions: result.actions };
    },
    [
      state,
      styleSetupContext,
      addMessage,
      dispatchActions,
      executeSideEffect,
      getRemainingQuestions,
      consumeNextQuestion,
    ],
  );

  const handleSendMessage = useCallback(
    async (content: string, optionId?: string) => {
      if (isProcessing) return;

      setIsProcessing(true);
      addUserMessage(content);

      try {
        const result = await processMessage({ text: content, optionId });
        if (result) {
          dispatchActions(result.actions);

          const isCompleting = result.actions.some(
            (a) => a.type === 'GO_TO_STEP' && a.payload === 'complete',
          );

          if (isCompleting) {
            persistConversation();
          }
        }
      } catch (error) {
        console.error('Message handling error:', error);
        addAssistantMessage(MESSAGES.error.unknown, 'text');
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      setIsProcessing,
      addUserMessage,
      processMessage,
      dispatchActions,
      addAssistantMessage,
      persistConversation,
    ],
  );

  const handleChoiceSelect = useCallback(
    (messageId: string, optionId: string) => {
      const message = messages.find((m) => m.id === messageId);
      const option = message?.options?.find((o) => o.id === optionId);
      if (option) {
        handleSendMessage(option.label, optionId);
      }
    },
    [messages, handleSendMessage],
  );

  const handlePlaceConfirmation = useCallback(
    (messageId: string, confirmed: boolean) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || !isPlaceCardMessage(message)) return;

      const { metadata } = message;
      const result = handlePlaceConfirmed(
        confirmed,
        metadata.name,
        metadata.roadAddress || metadata.address,
        state,
        metadata.category,
      );

      result.messages.forEach((msg) => {
        addMessage(msg);
      });

      dispatchActions(result.actions);
    },
    [messages, state, addMessage, dispatchActions],
  );

  const handleReviewAction = useCallback(
    (_messageId: string, action: 'complete' | 'edit') => {
      handleSendMessage(action === 'complete' ? '완벽해요!' : '수정해주세요', action);
    },
    [handleSendMessage],
  );

  return {
    handleSendMessage,
    handleChoiceSelect,
    handlePlaceConfirmation,
    handleReviewAction,
    fetchSmartQuestions,
    consumeNextQuestion,
    generateReview,
    isProcessing,
  };
}
