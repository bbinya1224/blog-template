'use client';

import { useChatStore } from './store';
import type { ConversationState } from './types';

export function useConversationActions() {
  const setStep = useChatStore((s) => s.setStep);
  const setSubStep = useChatStore((s) => s.setSubStep);
  const setUserName = useChatStore((s) => s.setUserName);
  const setHasExistingStyle = useChatStore((s) => s.setHasExistingStyle);
  const setStyleProfile = useChatStore((s) => s.setStyleProfile);
  const setSelectedTopic = useChatStore((s) => s.setSelectedTopic);
  const updateCollectedInfo = useChatStore((s) => s.updateCollectedInfo);
  const setGeneratedReview = useChatStore((s) => s.setGeneratedReview);
  const setIsProcessing = useChatStore((s) => s.setIsProcessing);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const addMessage = useChatStore((s) => s.addMessage);
  const dispatchAction = useChatStore((s) => s.dispatchAction);
  const dispatchActions = useChatStore((s) => s.dispatchActions);

  return {
    setStep,
    setSubStep,
    setUserName,
    setHasExistingStyle,
    setStyleProfile,
    setTopic: setSelectedTopic,
    updateCollectedInfo,
    setGeneratedReview,
    goToStep: setStep,
    addMessage,
    setIsProcessing,
    setSessionId,
    dispatchAction,
    dispatchActions,
  };
}

export function useConversationState(): ConversationState {
  return useChatStore((s) => ({
    step: s.step,
    subStep: s.subStep,
    userName: s.userName,
    hasExistingStyle: s.hasExistingStyle,
    styleProfile: s.styleProfile,
    selectedTopic: s.selectedTopic,
    collectedInfo: s.collectedInfo,
    generatedReview: s.generatedReview,
    sessionId: s.sessionId,
  }));
}

export function useMessages() {
  return useChatStore((s) => s.messages);
}

export function useIsProcessing() {
  return useChatStore((s) => s.isProcessing);
}
