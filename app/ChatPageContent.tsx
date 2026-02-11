'use client';

import { useEffect, useState, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ChatContainer } from '@/features/chat-review/ui';
import {
  conversationStateAtom,
  hasExistingStyleAtom,
  styleProfileAtom,
  selectedTopicAtom,
  useRecentReviews,
  useChatHandlers,
  useReviewGeneration,
} from '@/features/chat-review/model';
import { useChatMessagesJotai } from '@/features/chat-review/model/use-chat-messages-jotai';
import { createInitialMessage } from '@/features/chat-review/lib/conversation-engine';
import { createSummaryMessage } from '@/features/chat-review/lib/step-handlers';
import { MESSAGES, CHOICE_OPTIONS } from '@/features/chat-review/constants/messages';
import type { StyleProfile } from '@/entities/style-profile';
import type { StyleSetupContext } from '@/features/chat-review/lib/step-handlers';
import type { ChatMessage } from '@/entities/chat-message';
import type { ReviewTopic } from '@/features/chat-review/model';

interface ChatPageContentProps {
  userEmail: string;
  existingStyleProfile: StyleProfile | null;
}

export function ChatPageContent({
  userEmail,
  existingStyleProfile,
}: ChatPageContentProps) {
  // State
  const state = useAtomValue(conversationStateAtom);
  const setStyleProfile = useSetAtom(styleProfileAtom);
  const setHasExistingStyle = useSetAtom(hasExistingStyleAtom);
  const setSelectedTopic = useSetAtom(selectedTopicAtom);
  const [styleSetupContext, setStyleSetupContext] = useState<StyleSetupContext>(
    {},
  );
  const isInitializedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Hooks
  const { reviews: recentReviews } = useRecentReviews(5);
  const { messages, addMessage, addAssistantMessage } = useChatMessagesJotai();
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

  // Handle step changes (only when chat is active on this page)
  useEffect(() => {
    if (!isInitializedRef.current) return;
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
          addAssistantMessage(MESSAGES.smartFollowup.intro, 'text');
          try {
            const questions = await fetchSmartQuestions(
              s.collectedInfo,
              s.selectedTopic || 'restaurant'
            );
            if (questions.length > 0) {
              addAssistantMessage(questions[0], 'choice', CHOICE_OPTIONS.smartFollowupSkip);
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
          addMessage({
            ...createSummaryMessage(s),
            id: `msg_${Date.now()}`,
            timestamp: new Date(),
          } as ChatMessage);
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
  }, [state.step, addMessage, addAssistantMessage, fetchSmartQuestions, consumeNextQuestion, generateReview]);

  // Reset initialized flag when conversation is reset
  useEffect(() => {
    if (messages.length === 0) {
      isInitializedRef.current = false;
    }
  }, [messages.length]);

  // Handle category selection - starts chat without onboarding
  const handleCategorySelect = (categoryId: string) => {
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
      addAssistantMessage(message, 'text');
    }
  };

  // Wrapped send message
  const handleSendMessage = (message: string) => {
    // If chat not started yet, start it first
    if (messages.length === 0 && !isInitializedRef.current) {
      handleCategorySelect('restaurant');
    }
    originalHandleSendMessage(message);
  };

  // Input placeholder based on step
  const inputPlaceholder = getInputPlaceholder(state.step, messages.length === 0);

  return (
    <ChatContainer
      messages={messages}
      currentStep={state.step}
      selectedTopic={state.selectedTopic}
      isTyping={isProcessing}
      isInputDisabled={isProcessing}
      inputPlaceholder={inputPlaceholder}
      onSendMessage={handleSendMessage}
      onChoiceSelect={handleChoiceSelect}
      onPlaceConfirm={handlePlaceConfirmation}
      onReviewAction={handleReviewAction}
      onCategorySelect={handleCategorySelect}
      hasExistingStyle={state.hasExistingStyle}
      styleProfile={state.styleProfile}
      recentReviews={recentReviews}
      userName={state.userName ?? undefined}
    />
  );
}

// Pure function for placeholder text
function getInputPlaceholder(step: string, isInitial: boolean): string {
  if (isInitial) {
    return '리뷰를 작성하고 싶은 맛집을 알려주세요...';
  }
  const placeholders: Record<string, string> = {
    onboarding: '이름 또는 닉네임을 입력해주세요',
    'style-setup': '블로그 URL 또는 내용을 입력해주세요',
    'info-gathering': '자유롭게 입력해주세요',
    'smart-followup': '자유롭게 답변해주세요',
    'review-edit': '수정할 내용을 입력해주세요',
  };
  return placeholders[step] || '메시지를 입력해주세요';
}
