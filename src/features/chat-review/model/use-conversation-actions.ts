'use client';

import { useCallback } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  stepAtom,
  subStepAtom,
  userNameAtom,
  hasExistingStyleAtom,
  styleProfileAtom,
  selectedTopicAtom,
  collectedInfoAtom,
  generatedReviewAtom,
  messagesAtom,
  isProcessingAtom,
  conversationStateAtom,
  sessionIdAtom,
} from './atoms';
import type { ConversationStep, RestaurantInfoStep, ReviewTopic, ConversationAction } from './types';
import type { StyleProfile } from '@/entities/style-profile';
import type { ChatMessage } from '@/entities/chat-message';
import type { ReviewPayload } from '@/shared/types/review';

export function useConversationActions() {
  const setStep = useSetAtom(stepAtom);
  const setSubStep = useSetAtom(subStepAtom);
  const setUserName = useSetAtom(userNameAtom);
  const setHasExistingStyle = useSetAtom(hasExistingStyleAtom);
  const setStyleProfile = useSetAtom(styleProfileAtom);
  const setSelectedTopic = useSetAtom(selectedTopicAtom);
  const setCollectedInfo = useSetAtom(collectedInfoAtom);
  const setGeneratedReview = useSetAtom(generatedReviewAtom);
  const setMessages = useSetAtom(messagesAtom);
  const setIsProcessing = useSetAtom(isProcessingAtom);
  const setSessionId = useSetAtom(sessionIdAtom);

  // Unified dispatcher for all conversation actions
  const dispatchAction = useCallback(
    (action: ConversationAction) => {
      switch (action.type) {
        case 'SET_USER_NAME':
          setUserName(action.payload);
          break;
        case 'SET_STYLE_PROFILE':
          setStyleProfile(action.payload);
          break;
        case 'SET_HAS_EXISTING_STYLE':
          setHasExistingStyle(action.payload);
          break;
        case 'SET_TOPIC':
          setSelectedTopic(action.payload);
          break;
        case 'UPDATE_COLLECTED_INFO':
          setCollectedInfo((prev) => ({ ...prev, ...action.payload }));
          break;
        case 'SET_GENERATED_REVIEW':
          setGeneratedReview(action.payload);
          break;
        case 'GO_TO_STEP':
          setStep(action.payload);
          break;
        case 'SET_SUB_STEP':
          setSubStep(action.payload);
          break;
        case 'RESET':
          // Reset action can be added if needed
          break;
      }
    },
    [
      setUserName,
      setStyleProfile,
      setHasExistingStyle,
      setSelectedTopic,
      setCollectedInfo,
      setGeneratedReview,
      setStep,
      setSubStep,
    ],
  );

  // Batch dispatcher for multiple actions
  const dispatchActions = useCallback(
    (actions: ConversationAction[]) => {
      actions.forEach(dispatchAction);
    },
    [dispatchAction],
  );

  return {
    setStep,
    setSubStep,
    setUserName,
    setHasExistingStyle,
    setStyleProfile,
    setTopic: setSelectedTopic,
    updateCollectedInfo: (info: Partial<ReviewPayload>) =>
      setCollectedInfo((prev) => ({ ...prev, ...info })),
    setGeneratedReview,
    goToStep: setStep,
    addMessage: (message: ChatMessage) =>
      setMessages((prev) => [...prev, message]),
    setIsProcessing,
    setSessionId,
    dispatchAction,
    dispatchActions,
  };
}

export function useConversationState() {
  return useAtomValue(conversationStateAtom);
}

export function useMessages() {
  return useAtomValue(messagesAtom);
}

export function useIsProcessing() {
  return useAtomValue(isProcessingAtom);
}
