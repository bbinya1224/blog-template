'use client';

import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { conversationStateAtom, isProcessingAtom } from './atoms';
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
import type { PlaceCardMetadata, ChatMessage } from '@/entities/chat-message';

interface UseChatHandlersProps {
  userEmail: string;
  styleSetupContext: StyleSetupContext;
  setStyleSetupContext: React.Dispatch<React.SetStateAction<StyleSetupContext>>;
}

export function useChatHandlers({
  userEmail,
  styleSetupContext,
  setStyleSetupContext,
}: UseChatHandlersProps) {
  const state = useAtomValue(conversationStateAtom);
  const [isProcessing, setIsProcessing] = useAtom(isProcessingAtom);
  const { dispatchActions } = useConversationActions();
  const { messages, addMessage, addUserMessage, addAssistantMessage } =
    useChatMessages();

  const { analyzeBlogUrl } = useBlogAnalysis(state.userName);
  const { searchPlace } = usePlaceSearch();
  const { editReview } = useReviewGeneration({ userEmail });
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

  // Main message handler - simplified and declarative
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

  // Choice selection handler
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

  // Place confirmation handler
  const handlePlaceConfirmation = useCallback(
    (messageId: string, confirmed: boolean) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message?.metadata) return;

      const metadata = message.metadata as unknown as PlaceCardMetadata;
      const result = handlePlaceConfirmed(
        confirmed,
        metadata.name,
        metadata.roadAddress || metadata.address,
        state,
        metadata.category,
      );

      result.messages.forEach((msg) => {
        addMessage({
          ...msg,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        } as ChatMessage);
      });

      dispatchActions(result.actions);
    },
    [messages, state, addMessage, dispatchActions],
  );

  // Review action handler
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
    isProcessing,
  };
}
