'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { apiPost } from '@/shared/api/httpClient';
import { MESSAGES } from '../constants/messages';
import type { ReviewPayload } from '@/shared/types/review';

interface ParseConversationResponse {
  parsedInfo: Partial<ReviewPayload>;
  nextResponse: string;
  isReady: boolean;
  confidence: number;
}

const GENERATE_PATTERN = /생성|만들어|써줘|작성해|시작해/;

export function useConversation() {
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const updateCollectedInfo = useChatStore((s) => s.updateCollectedInfo);

  const parseConversation = useCallback(
    async (userMessage: string) => {
      const { collectedInfo, selectedTopic, messages } =
        useChatStore.getState();

      const conversationHistory = messages
        .filter((m) => m.type !== 'loading' && m.type !== 'summary')
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await apiPost<ParseConversationResponse>(
          '/api/chat/parse-conversation',
          {
            userMessage,
            collectedInfo,
            conversationHistory,
            selectedTopic: selectedTopic || 'restaurant',
          },
        );

        if (
          response.parsedInfo &&
          Object.keys(response.parsedInfo).length > 0
        ) {
          updateCollectedInfo(response.parsedInfo);
        }

        const currentMessages = useChatStore.getState().messages;
        const loadingMsg = [...currentMessages]
          .reverse()
          .find((m) => m.type === 'loading');

        const userWantsGenerate = GENERATE_PATTERN.test(userMessage);

        if (response.isReady && userWantsGenerate) {
          if (loadingMsg) {
            updateMessage(loadingMsg.id, {
              type: 'text',
              content: MESSAGES.conversation.generating,
            });
          }
          addMessage({
            role: 'assistant',
            type: 'loading',
            content: MESSAGES.generating.working,
          });
          useChatStore.getState().setStep('generating');
        } else if (response.isReady) {
          if (loadingMsg) {
            updateMessage(loadingMsg.id, {
              type: 'choice',
              content: response.nextResponse,
              options: [{ id: 'generate', label: '네, 생성해주세요!' }],
            });
          }
        } else {
          if (loadingMsg) {
            updateMessage(loadingMsg.id, {
              type: 'text',
              content: response.nextResponse,
            });
          }
        }
      } catch (error) {
        console.error('[useConversation] 파싱 에러:', error);
        const currentMessages = useChatStore.getState().messages;
        const loadingMsg = [...currentMessages]
          .reverse()
          .find((m) => m.type === 'loading');
        if (loadingMsg) {
          updateMessage(loadingMsg.id, {
            type: 'text',
            content: MESSAGES.conversation.error,
          });
        }
      }
    },
    [addMessage, updateMessage, updateCollectedInfo],
  );

  return { parseConversation };
}
