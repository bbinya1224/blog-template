'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { useConversationActions } from './useConversationActions';
import { useChatMessages } from './useChatMessages';
import { handleReviewEdited } from '../lib/step-handlers';
import { MESSAGES, CHOICE_OPTIONS } from '../constants/messages';

class SSEError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SSEError';
  }
}

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
      const response = await fetch('/api/chat/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: collectedInfo,
          styleProfile,
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

const MAX_PARSE_ERRORS = 5;

async function processStream(
  response: Response,
  onChunk: (text: string) => void,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let currentEvent: string | null = null;
  let parseErrorCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (currentEvent === 'error') {
            throw new SSEError(data.message || 'Stream error');
          } else if (currentEvent === 'done') {
            if (data.fullText) {
              fullText = data.fullText;
            }
          } else {
            if (data.token) {
              fullText += data.token;
              onChunk(fullText);
            } else if (data.fullText) {
              fullText = data.fullText;
            }
          }
          parseErrorCount = 0;
          currentEvent = null;
        } catch (e) {
          if (e instanceof SSEError) {
            throw e;
          }
          parseErrorCount++;
          if (parseErrorCount > MAX_PARSE_ERRORS) {
            throw new SSEError('Too many parse errors in stream');
          }
          console.warn('[processStream] parse error:', e);
        }
      }
    }
  }

  return fullText;
}
