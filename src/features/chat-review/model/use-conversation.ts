'use client';

import { useReducer, useCallback, useMemo } from 'react';
import type {
  ConversationState,
  ConversationStep,
  ConversationAction,
  RestaurantInfoStep,
  ReviewTopic,
} from './types';
import { stepTransitions, initialConversationState } from './types';
import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewPayload } from '@/shared/types/review';

function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };

    case 'SET_STYLE_PROFILE':
      return { ...state, styleProfile: action.payload, hasExistingStyle: true };

    case 'SET_HAS_EXISTING_STYLE':
      return { ...state, hasExistingStyle: action.payload };

    case 'SET_TOPIC':
      return { ...state, selectedTopic: action.payload };

    case 'UPDATE_COLLECTED_INFO':
      return {
        ...state,
        collectedInfo: { ...state.collectedInfo, ...action.payload },
      };

    case 'SET_GENERATED_REVIEW':
      return { ...state, generatedReview: action.payload };

    case 'GO_TO_STEP':
      return { ...state, step: action.payload };

    case 'SET_SUB_STEP':
      return { ...state, subStep: action.payload };

    case 'RESET':
      return { ...initialConversationState };

    default:
      return state;
  }
}

export interface UseConversationReturn {
  state: ConversationState;
  // Actions
  setUserName: (name: string) => void;
  setStyleProfile: (profile: StyleProfile) => void;
  setHasExistingStyle: (has: boolean) => void;
  setTopic: (topic: ReviewTopic) => void;
  updateCollectedInfo: (info: Partial<ReviewPayload>) => void;
  setGeneratedReview: (review: string) => void;
  goToStep: (step: ConversationStep) => void;
  setSubStep: (subStep: RestaurantInfoStep) => void;
  reset: () => void;
  // Computed
  canTransitionTo: (step: ConversationStep) => boolean;
  isStepComplete: (step: ConversationStep) => boolean;
  progress: number;
}

const STEP_ORDER: ConversationStep[] = [
  'onboarding',
  'style-check',
  'style-setup',
  'topic-select',
  'info-gathering',
  'confirmation',
  'generating',
  'review-edit',
  'complete',
];

export function useConversation(
  initial?: Partial<ConversationState>
): UseConversationReturn {
  const [state, dispatch] = useReducer(conversationReducer, {
    ...initialConversationState,
    ...initial,
  });

  const setUserName = useCallback((name: string) => {
    dispatch({ type: 'SET_USER_NAME', payload: name });
  }, []);

  const setStyleProfile = useCallback((profile: StyleProfile) => {
    dispatch({ type: 'SET_STYLE_PROFILE', payload: profile });
  }, []);

  const setHasExistingStyle = useCallback((has: boolean) => {
    dispatch({ type: 'SET_HAS_EXISTING_STYLE', payload: has });
  }, []);

  const setTopic = useCallback((topic: ReviewTopic) => {
    dispatch({ type: 'SET_TOPIC', payload: topic });
  }, []);

  const updateCollectedInfo = useCallback((info: Partial<ReviewPayload>) => {
    dispatch({ type: 'UPDATE_COLLECTED_INFO', payload: info });
  }, []);

  const setGeneratedReview = useCallback((review: string) => {
    dispatch({ type: 'SET_GENERATED_REVIEW', payload: review });
  }, []);

  const goToStep = useCallback((step: ConversationStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);

  const setSubStep = useCallback((subStep: RestaurantInfoStep) => {
    dispatch({ type: 'SET_SUB_STEP', payload: subStep });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const canTransitionTo = useCallback(
    (targetStep: ConversationStep): boolean => {
      const allowedTransitions = stepTransitions[state.step];
      return allowedTransitions?.includes(targetStep) ?? false;
    },
    [state.step]
  );

  const isStepComplete = useCallback(
    (step: ConversationStep): boolean => {
      const currentIndex = STEP_ORDER.indexOf(state.step);
      const checkIndex = STEP_ORDER.indexOf(step);
      return checkIndex < currentIndex;
    },
    [state.step]
  );

  const progress = useMemo(() => {
    const currentIndex = STEP_ORDER.indexOf(state.step);
    return Math.round((currentIndex / (STEP_ORDER.length - 1)) * 100);
  }, [state.step]);

  return {
    state,
    setUserName,
    setStyleProfile,
    setHasExistingStyle,
    setTopic,
    updateCollectedInfo,
    setGeneratedReview,
    goToStep,
    setSubStep,
    reset,
    canTransitionTo,
    isStepComplete,
    progress,
  };
}
