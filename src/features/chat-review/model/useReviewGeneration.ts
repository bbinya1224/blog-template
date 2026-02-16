'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { useConversationActions } from './useConversationActions';
import { useChatMessages } from './useChatMessages';
import { handleReviewEdited } from '../lib/step-handlers';
import { MESSAGES } from '../constants/messages';

interface UseReviewGenerationProps {
  userEmail: string;
}

export function useReviewGeneration({ userEmail }: UseReviewGenerationProps) {
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
      const response = await fetch('/api/chat/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: collectedInfo,
          styleProfile,
          userEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate review');

      const fullText = await processStream(response, (text) => {
        updateMessage(msgId, {
          content: text,
          type: 'text',
          metadata: { streaming: true },
        });
      });

      setGeneratedReview(fullText);
      goToStep('review-edit');

      updateMessage(msgId, {
        type: 'review-preview',
        content: MESSAGES.reviewEdit.complete,
        metadata: { review: fullText, characterCount: fullText.length },
      });
    } catch (error) {
      console.error('[generateReview] Failed:', error);
      addAssistantMessage(MESSAGES.error.unknown, 'text');
    }
  }, [
    collectedInfo,
    styleProfile,
    userEmail,
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
        const response = await fetch('/api/chat/edit-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalReview: generatedReview || '',
            editRequest: request,
            styleProfile,
          }),
        });

        if (!response.ok) throw new Error('Failed to edit review');

        const fullText = await processStream(response, (text) => {
          updateMessage(msgId, {
            content: text,
            type: 'text',
            metadata: { streaming: true },
          });
        });

        updateMessage(msgId, {
          type: 'review-preview',
          content: MESSAGES.reviewEdit.complete,
          metadata: { review: fullText, characterCount: fullText.length },
        });

        const result = handleReviewEdited(fullText);
        dispatchActions(result.actions);
      } catch (error) {
        console.error('[editReview] Failed:', error);
        addAssistantMessage(MESSAGES.error.unknown, 'text');
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

async function processStream(
  response: Response,
  onChunk: (text: string) => void,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.token) {
            fullText += data.token;
            onChunk(fullText);
          } else if (data.fullText) {
            fullText = data.fullText;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return fullText;
}
