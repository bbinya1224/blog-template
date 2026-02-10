'use client';

import { useCallback } from 'react';
import type { ConversationState, ConversationAction } from './types';
import type { ChatMessage } from '@/entities/chat-message';
import {
  handleOnboarding,
  handleStyleSetup,
  handleStyleCheck,
  handleTopicSelect,
  handleInfoGathering,
  handleConfirmation,
  handleSmartFollowup,
  handleReviewEdit,
  type StepHandlerResult,
  type StyleSetupContext,
  type InfoGatheringResult,
  type SmartFollowupResult,
  type ReviewEditResult,
} from '../lib/step-handlers';

interface UseMessageProcessorProps {
  state: ConversationState;
  styleSetupContext: StyleSetupContext;
  setStyleSetupContext: React.Dispatch<React.SetStateAction<StyleSetupContext>>;
  addMessage: (message: ChatMessage) => void;
  onBlogUrlAnalysis: (url: string) => Promise<void>;
  onPlaceSearch: (query: string) => Promise<void>;
  onReviewEditRequest: (request: string) => Promise<void>;
  smartFollowupRemainingQuestions: () => string[];
  onConsumeSmartFollowup: () => void;
}

interface UseMessageProcessorReturn {
  processMessage: (content: string) => Promise<{
    actions: ConversationAction[];
    messages: Partial<ChatMessage>[];
  } | null>;
}

export function useMessageProcessor({
  state,
  styleSetupContext,
  setStyleSetupContext,
  addMessage,
  onBlogUrlAnalysis,
  onPlaceSearch,
  onReviewEditRequest,
  smartFollowupRemainingQuestions,
  onConsumeSmartFollowup,
}: UseMessageProcessorProps): UseMessageProcessorReturn {

  const addResultMessages = useCallback((messages: Partial<ChatMessage>[]) => {
    messages.forEach((msg) => {
      addMessage({
        ...msg,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      } as ChatMessage);
    });
  }, [addMessage]);

  const processMessage = useCallback(async (content: string): Promise<{
    actions: ConversationAction[];
    messages: Partial<ChatMessage>[];
  } | null> => {
    let result: StepHandlerResult | InfoGatheringResult | SmartFollowupResult | ReviewEditResult;

    switch (state.step) {
      case 'onboarding':
        result = handleOnboarding(content, state);
        break;

      case 'style-check':
        result = handleStyleCheck(content, state);
        if (result.nextStep === 'style-setup') {
          setStyleSetupContext({});
        }
        break;

      case 'style-setup':
        result = handleStyleSetup(content, state, styleSetupContext);
        // URL 분석이 필요한 경우
        if (content.includes('blog.naver.com')) {
          await onBlogUrlAnalysis(content);
          return null; // Early return, processing handled elsewhere
        }
        // 방법 선택 업데이트
        updateStyleSetupMethod(content, setStyleSetupContext);
        break;

      case 'topic-select':
        result = handleTopicSelect(content, state);
        break;

      case 'info-gathering': {
        const infoResult = handleInfoGathering(content, state);
        // 장소 검색이 필요한 경우
        if (infoResult.placeSearchQuery) {
          await onPlaceSearch(infoResult.placeSearchQuery);
          return null; // Early return, processing handled elsewhere
        }
        result = infoResult;
        break;
      }

      case 'smart-followup': {
        const remaining = smartFollowupRemainingQuestions();
        result = handleSmartFollowup(content, state, remaining);
        if (!(result as SmartFollowupResult).skipFollowup && remaining.length > 0) {
          onConsumeSmartFollowup();
        }
        break;
      }

      case 'confirmation':
        result = handleConfirmation(content, state);
        break;

      case 'review-edit': {
        const editResult = handleReviewEdit(content, state);
        // 수정 요청이 있는 경우
        if (editResult.editRequest) {
          await onReviewEditRequest(editResult.editRequest);
          return null; // Early return, processing handled elsewhere
        }
        result = editResult;
        break;
      }

      default:
        result = { messages: [], actions: [] };
    }

    addResultMessages(result.messages);
    return {
      actions: result.actions as ConversationAction[],
      messages: result.messages,
    };
  }, [
    state,
    styleSetupContext,
    setStyleSetupContext,
    addResultMessages,
    onBlogUrlAnalysis,
    onPlaceSearch,
    onReviewEditRequest,
    smartFollowupRemainingQuestions,
    onConsumeSmartFollowup,
  ]);

  return { processMessage };
}

function updateStyleSetupMethod(
  content: string,
  setStyleSetupContext: React.Dispatch<React.SetStateAction<StyleSetupContext>>
) {
  if (content.includes('블로그') || content.includes('주소') || content === '1') {
    setStyleSetupContext({ method: 'blog-url' });
  } else if (content.includes('첨부') || content.includes('붙여') || content === '2') {
    setStyleSetupContext((prev) => ({ ...prev, method: 'paste-text' }));
  } else if (content.includes('직접') || content.includes('설정') || content === '3') {
    setStyleSetupContext((prev) => ({
      ...prev,
      method: 'questionnaire',
      questionnaireStep: 0,
    }));
  }
}
