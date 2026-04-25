'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { handleReviewEdited } from '../lib/step-handlers';
import { MESSAGES } from '../constants/messages';
import { CHOICE_OPTIONS } from '../constants/choiceOptions';
import { apiSSE, SSEError } from '@/shared/api/sseClient';

export function useReviewGeneration() {
  const collectedInfo = useChatStore((s) => s.collectedInfo);
  const styleProfile = useChatStore((s) => s.styleProfile);
  const generatedReview = useChatStore((s) => s.generatedReview);
  const setGeneratedReview = useChatStore((s) => s.setGeneratedReview);
  const setStep = useChatStore((s) => s.setStep);
  const dispatchActions = useChatStore((s) => s.dispatchActions);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const setSavedReviewId = useChatStore((s) => s.setSavedReviewId);

  const generateReview = useCallback(async () => {
    if (!styleProfile) {
      addAssistantMessage(
        '글 스타일 프로필이 아직 없어요! 스타일 분석을 먼저 진행해주세요.',
      );
      setStep('style-check');
      return;
    }

    setSavedReviewId(null);
    const msgId = addAssistantMessage('', 'text', undefined, {
      streaming: true,
    });

    try {
      let receivedReviewId: string | null = null;

      const fullText = await apiSSE(
        '/api/chat/generate-review',
        { payload: collectedInfo, styleProfile: styleProfile ?? null },
        {
          onToken: (text) => {
            updateMessage(msgId, {
              content: text,
              type: 'text',
              metadata: { streaming: true },
            });
          },
          onDone: (_fullText, data) => {
            const candidate = data?.reviewId;
            receivedReviewId =
              typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
          },
        },
      );

      if (!receivedReviewId) {
        console.warn('[generateReview] reviewId 없음 — DB 저장 실패 가능성');
      }

      setGeneratedReview(fullText);
      setSavedReviewId(receivedReviewId);
      setStep('review-edit');

      updateMessage(msgId, {
        type: 'text',
        content: fullText,
        metadata: { streaming: false, reviewComplete: true },
      });
    } catch (error) {
      setSavedReviewId(null);
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
    setSavedReviewId,
    setStep,
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
          type: 'text',
          content: fullText,
          metadata: { streaming: false, reviewComplete: true },
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
