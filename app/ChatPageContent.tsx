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

  // Hooks
  const { reviews: recentReviews } = useRecentReviews(5);
  const { messages, addMessage, addAssistantMessage } = useChatMessagesJotai();
  const { generateReview } = useReviewGeneration({ userEmail });
  const {
    handleSendMessage: originalHandleSendMessage,
    handleChoiceSelect,
    handlePlaceConfirmation,
    handleReviewAction,
    isProcessing,
    isStreaming,
  } = useChatHandlers({ userEmail, styleSetupContext, setStyleSetupContext });

  // Initialize existing style profile
  useEffect(() => {
    if (existingStyleProfile) {
      setStyleProfile(existingStyleProfile);
      setHasExistingStyle(true);
    }
  }, [existingStyleProfile, setStyleProfile, setHasExistingStyle]);

  // Handle step changes
  useEffect(() => {
    const handleStepChange = async () => {
      switch (state.step) {
        case 'style-check':
          if (state.hasExistingStyle && state.styleProfile) {
            addMessage(createInitialMessage('style-check', state));
          }
          break;
        case 'topic-select':
          addMessage(createInitialMessage('topic-select', state));
          break;
        case 'info-gathering':
          if (!state.subStep) {
            addMessage(createInitialMessage('info-gathering', state));
          }
          break;
        case 'confirmation':
          addMessage({
            ...createSummaryMessage(state),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

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
      isTyping={isStreaming || isProcessing}
      isInputDisabled={isStreaming}
      inputPlaceholder={inputPlaceholder}
      onSendMessage={handleSendMessage}
      onChoiceSelect={handleChoiceSelect}
      onPlaceConfirm={handlePlaceConfirmation}
      onReviewAction={handleReviewAction}
      onCategorySelect={handleCategorySelect}
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
    'review-edit': '수정할 내용을 입력해주세요',
  };
  return placeholders[step] || '메시지를 입력해주세요';
}
