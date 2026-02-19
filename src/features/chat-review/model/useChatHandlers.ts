'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from './store';
import { useConversationActions } from './useConversationActions';
import { useChatMessages } from './useChatMessages';
import { useMessageProcessor } from './useMessageProcessor';
import { useBlogAnalysis } from './useBlogAnalysis';
import { usePlaceSearch } from './usePlaceSearch';
import { useReviewGeneration } from './useReviewGeneration';
import { useSmartFollowup } from './useSmartFollowup';
import { handlePlaceConfirmed } from '../lib/step-handlers';
import { MESSAGES } from '../constants/messages';
import type { StyleSetupContext } from '../lib/step-handlers';
import { isPlaceCardMessage } from '@/entities/chat-message';

interface UseChatHandlersProps {
  userEmail: string;
  styleSetupContext: StyleSetupContext;
  setStyleSetupContext: React.Dispatch<React.SetStateAction<StyleSetupContext>>;
}

export function useChatHandlers({
  userEmail: _userEmail,
  styleSetupContext,
  setStyleSetupContext,
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
  const isProcessing = useChatStore((s) => s.isProcessing);
  const setIsProcessing = useChatStore((s) => s.setIsProcessing);
  const { dispatchActions } = useConversationActions();
  const { messages, addMessage, addUserMessage, addAssistantMessage } =
    useChatMessages();

  const { analyzeBlogUrl } = useBlogAnalysis(state.userName);
  const { searchPlace } = usePlaceSearch();
  const { editReview, generateReview } = useReviewGeneration();
  const {
    fetchSmartQuestions,
    consumeNextQuestion,
    getRemainingQuestions,
    reset: resetSmartFollowup,
  } = useSmartFollowup();

  const { processMessage } = useMessageProcessor({
    state,
    styleSetupContext,
    setStyleSetupContext,
    addMessage,
    onBlogUrlAnalysis: analyzeBlogUrl,
    onPlaceSearch: searchPlace,
    onReviewEditRequest: editReview,
    smartFollowupRemainingQuestions: getRemainingQuestions,
    onConsumeSmartFollowup: consumeNextQuestion,
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (isProcessing) return;

      setIsProcessing(true);
      addUserMessage(content);

      try {
        const result = await processMessage(content);
        if (result) {
          dispatchActions(result.actions);
        }
      } catch (error) {
        console.error('Message handling error:', error);
        addAssistantMessage(MESSAGES.error.unknown, 'text');
      }

      setIsProcessing(false);
    },
    [
      isProcessing,
      setIsProcessing,
      addUserMessage,
      processMessage,
      dispatchActions,
      addAssistantMessage,
    ],
  );

  const handleChoiceSelect = useCallback(
    (messageId: string, optionId: string) => {
      const message = messages.find((m) => m.id === messageId);
      const option = message?.options?.find((o) => o.id === optionId);
      if (option) {
        handleSendMessage(option.label);
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
      handleSendMessage(action === 'complete' ? '완벽해요!' : '수정해주세요');
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
    resetSmartFollowup,
    generateReview,
    isProcessing,
  };
}
