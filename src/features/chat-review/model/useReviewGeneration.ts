'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { useConversationActions } from './useConversationActions';
import { useChatMessages } from './useChatMessages';
import { handleReviewEdited } from '../lib/step-handlers';
import { MESSAGES, CHOICE_OPTIONS } from '../constants/messages';
import { apiSSE, SSEError } from '@/shared/api/sseClient';

export function useReviewGeneration() {
  const collectedInfo = useChatStore((s) => s.collectedInfo);
  const styleProfile = useChatStore((s) => s.styleProfile);
  const generatedReview = useChatStore((s) => s.generatedReview);
  const { setGeneratedReview, goToStep, dispatchActions } =
    useConversationActions();
  const { addAssistantMessage, updateMessage } = useChatMessages();

  const generateReview = useCallback(async () => {
    const msgId = addAssistantMessage('', 'text', undefined, {
      streaming: true,
    });

    try {
      const fullText = await apiSSE(
        '/api/chat/generate-review',
        { payload: collectedInfo, styleProfile },
        {
          onToken: (text) => {
            updateMessage(msgId, {
              content: text,
              type: 'text',
              metadata: { streaming: true },
            });
          },
        },
      );

      setGeneratedReview(fullText);
      goToStep('review-edit');

      updateMessage(msgId, {
        type: 'review-preview',
        content: MESSAGES.reviewEdit.complete,
        metadata: { review: fullText, characterCount: fullText.length },
      });
    } catch (error) {
      console.error('[generateReview] Failed:', error);
      if (error instanceof SSEError) {
        addAssistantMessage(
          MESSAGES.error.network,
          'choice',
          CHOICE_OPTIONS.errorRecovery,
        );
      } else {
        addAssistantMessage(MESSAGES.error.unknown, 'text');
      }
    }
  }, [
    collectedInfo,
    styleProfile,
    setGeneratedReview,
    goToStep,
    addAssistantMessage,
    updateMessage,
  ]);

  const editReview = useCallback(
    async (request: string) => {
      const msgId = addAssistantMessage('', 'text', undefined, {
        streaming: true,
      });

      try {
        const fullText = await apiSSE(
          '/api/chat/edit-review',
          {
            originalReview: generatedReview || '',
            editRequest: request,
            styleProfile,
          },
          {
            onToken: (text) => {
              updateMessage(msgId, {
                content: text,
                type: 'text',
                metadata: { streaming: true },
              });
            },
          },
        );

        updateMessage(msgId, {
          type: 'review-preview',
          content: MESSAGES.reviewEdit.complete,
          metadata: { review: fullText, characterCount: fullText.length },
        });

        const result = handleReviewEdited(fullText);
        dispatchActions(result.actions);
      } catch (error) {
        console.error('[editReview] Failed:', error);
        if (error instanceof SSEError) {
          addAssistantMessage(
            MESSAGES.error.network,
            'choice',
            CHOICE_OPTIONS.errorRecovery,
          );
        } else {
          addAssistantMessage(MESSAGES.error.unknown, 'text');
        }
      }
    },
    [
      generatedReview,
      styleProfile,
      dispatchActions,
      addAssistantMessage,
      updateMessage,
    ],
  );

  return { generateReview, editReview };
}
