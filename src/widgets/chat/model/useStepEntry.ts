'use client';

import { useEffect, useRef } from 'react';
import {
  useChatStore,
  createInitialMessage,
  createSummaryMessage,
  MESSAGES,
  CHOICE_OPTIONS,
} from '@/features/chat-review';
import type { ConversationStep } from '@/features/chat-review/model/types';

interface UseStepEntryParams {
  fetchSmartQuestions: (
    collectedInfo: Record<string, unknown>,
    selectedTopic: string,
  ) => Promise<string[]>;
  consumeNextQuestion: () => void;
  generateReview: () => Promise<void>;
}

export function useStepEntry({
  fetchSmartQuestions,
  consumeNextQuestion,
  generateReview,
}: UseStepEntryParams) {
  const isInitializedRef = useRef(false);
  const prevStepRef = useRef<ConversationStep | null>(null);

  const messages = useChatStore((s) => s.messages);
  const step = useChatStore((s) => s.step);
  const subStep = useChatStore((s) => s.subStep);
  const hasExistingStyle = useChatStore((s) => s.hasExistingStyle);
  const styleProfile = useChatStore((s) => s.styleProfile);
  const collectedInfo = useChatStore((s) => s.collectedInfo);
  const selectedTopic = useChatStore((s) => s.selectedTopic);
  const addMessage = useChatStore((s) => s.addMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);

  // Reset initialized flag when conversation is reset
  useEffect(() => {
    if (messages.length === 0) {
      isInitializedRef.current = false;
      prevStepRef.current = null;
    }
  }, [messages.length]);

  // Handle step changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (step === prevStepRef.current) return;
    prevStepRef.current = step;

    const orchestrationState = useChatStore.getState();

    const handleStepChange = async () => {
      switch (step) {
        case 'style-check':
          if (hasExistingStyle && styleProfile) {
            addMessage(createInitialMessage('style-check', orchestrationState));
          }
          break;
        case 'topic-select':
          addMessage(createInitialMessage('topic-select', orchestrationState));
          break;
        case 'info-gathering':
          if (!subStep) {
            addMessage(
              createInitialMessage('info-gathering', orchestrationState),
            );
          }
          break;
        case 'smart-followup': {
          const stepAtRequest = step;
          try {
            const questions = await fetchSmartQuestions(
              collectedInfo,
              selectedTopic || 'restaurant',
            );
            if (useChatStore.getState().step !== stepAtRequest) return;
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
            if (useChatStore.getState().step !== stepAtRequest) return;
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
        case 'generating': {
          const stepBeforeGenerate = step;
          await generateReview();
          if (useChatStore.getState().step !== stepBeforeGenerate) return;
          break;
        }
      }
    };

    handleStepChange().catch((error) => {
      console.error('[useStepEntry] handleStepChange 에러:', error);
      addAssistantMessage(MESSAGES.error.unknown, 'text');
    });
  }, [
    step,
    hasExistingStyle,
    styleProfile,
    subStep,
    collectedInfo,
    selectedTopic,
    addMessage,
    addAssistantMessage,
    fetchSmartQuestions,
    consumeNextQuestion,
    generateReview,
  ]);

  return { isInitializedRef };
}
