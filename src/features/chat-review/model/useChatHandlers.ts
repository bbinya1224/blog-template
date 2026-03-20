'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from './store';
import { useConversationPersistence } from './useConversationPersistence';
import { useSideEffects } from './useSideEffects';
import { useSmartFollowup } from './useSmartFollowup';
import { handlePlaceConfirmed } from '../lib/step-handlers';
import { FLOW_GRAPH } from './flow';
import { MESSAGES } from '../constants/messages';
import { isPlaceCardMessage } from '@/entities/chat-message';
import type { FlowInputContext } from './flow';
import type { ConversationAction, UserInput } from './types';

interface UseChatHandlersProps {
  userEmail: string;
}

export function useChatHandlers({
  userEmail: _userEmail,
}: UseChatHandlersProps) {
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
  const {
    styleSetupContext,
    isProcessing,
    messages,
    setIsProcessing,
    dispatchActions,
    addMessage,
    addUserMessage,
    addAssistantMessage,
  } = useChatStore(
    useShallow((s) => ({
      styleSetupContext: s.styleSetupContext,
      isProcessing: s.isProcessing,
      messages: s.messages,
      setIsProcessing: s.setIsProcessing,
      dispatchActions: s.dispatchActions,
      addMessage: s.addMessage,
      addUserMessage: s.addUserMessage,
      addAssistantMessage: s.addAssistantMessage,
    })),
  );

  const { executeSideEffect, generateReview } = useSideEffects(state.userName);
  const { fetchSmartQuestions, consumeNextQuestion, getRemainingQuestions } =
    useSmartFollowup();
  const persistConversation = useConversationPersistence();

  const processMessage = useCallback(
    async (input: UserInput) => {
      const node = FLOW_GRAPH[state.step];
      if (!node?.onInput) {
        return { actions: [] as ConversationAction[] };
      }

      const ctx: FlowInputContext = {
        state,
        styleSetupContext,
        getRemainingQuestions,
        consumeNextQuestion,
      };
      const result = node.onInput(input, ctx);

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
        console.error('[useChatHandlers] 메시지 처리 에러:', error);
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
      handleSendMessage(
        action === 'complete' ? '완벽해요!' : '수정해주세요',
        action,
      );
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
