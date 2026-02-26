'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from './store';
import { useBlogAnalysis } from './useBlogAnalysis';
import { usePlaceSearch } from './usePlaceSearch';
import { useReviewGeneration } from './useReviewGeneration';
import { useSmartFollowup } from './useSmartFollowup';
import {
  handleStyleSetup,
  handleStyleCheck,
  handleTopicSelect,
  handleInfoGathering,
  handleConfirmation,
  handleSmartFollowup,
  handleReviewEdit,
  handlePlaceConfirmed,
  type StepHandlerResult,
  type StyleSetupContext,
  type InfoGatheringResult,
  type SmartFollowupResult,
  type ReviewEditResult,
} from '../lib/step-handlers';
import { MESSAGES } from '../constants/messages';
import { isPlaceCardMessage } from '@/entities/chat-message';
import { filterConversationMessages } from '../lib/filterConversationMessages';
import { apiPut } from '@/shared/api/httpClient';

interface UseChatHandlersProps {
  userEmail: string;
  styleSetupContext: StyleSetupContext;
  setStyleSetupContext: React.Dispatch<React.SetStateAction<StyleSetupContext>>;
}

export function useChatHandlers({
  userEmail: _userEmail,
  styleSetupContext,
  setStyleSetupContext,
}: UseChatHandlersProps) {
  const state = useChatStore(
    useShallow((s) => ({
      step: s.step,
      subStep: s.subStep,
      userName: s.userName,
      hasExistingStyle: s.hasExistingStyle,
      styleProfile: s.styleProfile,
      selectedTopic: s.selectedTopic,
      collectedInfo: s.collectedInfo,
      generatedReview: s.generatedReview,
      sessionId: s.sessionId,
    })),
  );
  const isProcessing = useChatStore((s) => s.isProcessing);
  const setIsProcessing = useChatStore((s) => s.setIsProcessing);
  const dispatchActions = useChatStore((s) => s.dispatchActions);
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);

  const { analyzeBlogUrl } = useBlogAnalysis(state.userName);
  const { searchPlace } = usePlaceSearch();
  const { editReview, generateReview } = useReviewGeneration();
  const {
    fetchSmartQuestions,
    consumeNextQuestion,
    getRemainingQuestions,
  } = useSmartFollowup();

  // Step별 메시지 처리 — 이전 useMessageProcessor의 역할을 직접 수행
  const processMessage = useCallback(
    async (content: string) => {
      let result:
        | StepHandlerResult
        | InfoGatheringResult
        | SmartFollowupResult
        | ReviewEditResult;

      switch (state.step) {
        case 'style-check':
          result = handleStyleCheck(content, state);
          if (result.nextStep === 'style-setup') {
            setStyleSetupContext({});
          }
          break;

        case 'style-setup':
          if (content.includes('blog.naver.com')) {
            updateStyleSetupMethod(content, setStyleSetupContext);
            await analyzeBlogUrl(content);
            return null;
          }
          result = handleStyleSetup(content, state, styleSetupContext);
          updateStyleSetupMethod(content, setStyleSetupContext);
          break;

        case 'topic-select':
          result = handleTopicSelect(content, state);
          break;

        case 'info-gathering': {
          const infoResult = handleInfoGathering(content, state);
          if (infoResult.placeSearchQuery) {
            await searchPlace(infoResult.placeSearchQuery);
            return null;
          }
          result = infoResult;
          break;
        }

        case 'smart-followup': {
          const remaining = getRemainingQuestions();
          result = handleSmartFollowup(content, state, remaining);
          if (
            !(result as SmartFollowupResult).skipFollowup &&
            remaining.length > 0
          ) {
            consumeNextQuestion();
          }
          break;
        }

        case 'confirmation':
          result = handleConfirmation(content, state);
          break;

        case 'review-edit': {
          const editResult = handleReviewEdit(content, state);
          if (editResult.editRequest) {
            await editReview(editResult.editRequest);
            return null;
          }
          result = editResult;
          break;
        }

        default:
          result = { messages: [], actions: [] };
      }

      result.messages.forEach((msg) => addMessage(msg));
      return { actions: result.actions };
    },
    [
      state,
      styleSetupContext,
      setStyleSetupContext,
      addMessage,
      analyzeBlogUrl,
      searchPlace,
      editReview,
      getRemainingQuestions,
      consumeNextQuestion,
    ],
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (isProcessing) return;

      setIsProcessing(true);
      addUserMessage(content);

      try {
        const result = await processMessage(content);
        if (result) {
          dispatchActions(result.actions);

          const isCompleting = result.actions.some(
            (a) => a.type === 'GO_TO_STEP' && a.payload === 'complete',
          );

          if (isCompleting) {
            const { savedReviewId, generatedReview, messages: allMessages } =
              useChatStore.getState();
            if (savedReviewId && generatedReview) {
              const conversation = filterConversationMessages(allMessages);
              apiPut(`/api/reviews/${encodeURIComponent(savedReviewId)}`, {
                content: generatedReview,
                conversation,
              }).catch((err) => {
                console.error('대화 내역 저장 실패:', err);
              });
            }
          }
        }
      } catch (error) {
        console.error('Message handling error:', error);
        addAssistantMessage(MESSAGES.error.unknown, 'text');
      } finally {
        setIsProcessing(false);
      }
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

  const handlePlaceConfirmation = useCallback(
    (messageId: string, confirmed: boolean) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || !isPlaceCardMessage(message)) return;

      const { metadata } = message;
      const result = handlePlaceConfirmed(
        confirmed,
        metadata.name,
        metadata.roadAddress || metadata.address,
        state,
        metadata.category,
      );

      result.messages.forEach((msg) => {
        addMessage(msg);
      });

      dispatchActions(result.actions);
    },
    [messages, state, addMessage, dispatchActions],
  );

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
    generateReview,
    isProcessing,
  };
}

function updateStyleSetupMethod(
  content: string,
  setStyleSetupContext: React.Dispatch<React.SetStateAction<StyleSetupContext>>,
) {
  setStyleSetupContext((prev) => {
    if (prev.method) return prev;

    if (
      content.includes('블로그') ||
      content.includes('주소') ||
      content === '1'
    ) {
      return { ...prev, method: 'blog-url' };
    } else if (
      content.includes('첨부') ||
      content.includes('붙여') ||
      content === '2'
    ) {
      return { ...prev, method: 'paste-text' };
    } else if (
      content.includes('직접') ||
      content.includes('설정') ||
      content === '3'
    ) {
      return { ...prev, method: 'questionnaire', questionnaireStep: 0 };
    }
    return prev;
  });
}
