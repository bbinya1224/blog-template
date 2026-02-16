'use client';

import { ChatContainer } from '@/features/chat-review/ui';
import { useChatOrchestration } from '@/features/chat-review';
import type { StyleProfile } from '@/entities/style-profile';

interface ChatPageContentProps {
  userEmail: string;
  existingStyleProfile: StyleProfile | null;
}

export function ChatPageContent({
  userEmail,
  existingStyleProfile,
}: ChatPageContentProps) {
  const {
    messages,
    state,
    isProcessing,
    inputPlaceholder,
    recentReviews,
    handleSendMessage,
    handleChoiceSelect,
    handlePlaceConfirmation,
    handleReviewAction,
    handleCategorySelect,
  } = useChatOrchestration({ userEmail, existingStyleProfile });

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
