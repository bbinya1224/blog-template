'use client';

import { useChatStore } from './store';

export function useConversationActions() {
  const setStep = useChatStore((s) => s.setStep);
  const setSubStep = useChatStore((s) => s.setSubStep);
  const setHasExistingStyle = useChatStore((s) => s.setHasExistingStyle);
  const setStyleProfile = useChatStore((s) => s.setStyleProfile);
  const setSelectedTopic = useChatStore((s) => s.setSelectedTopic);
  const updateCollectedInfo = useChatStore((s) => s.updateCollectedInfo);
  const setGeneratedReview = useChatStore((s) => s.setGeneratedReview);
  const dispatchActions = useChatStore((s) => s.dispatchActions);

  return {
    setStep,
    setSubStep,
    setHasExistingStyle,
    setStyleProfile,
    setSelectedTopic,
    updateCollectedInfo,
    setGeneratedReview,
    goToStep: setStep,
    dispatchActions,
  };
}
