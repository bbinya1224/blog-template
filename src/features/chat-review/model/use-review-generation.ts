'use client';

import { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { conversationStateAtom } from './atoms';
import { useConversationActions } from './use-conversation-actions';
import { useChatMessagesJotai } from './use-chat-messages-jotai';
import { handleReviewEdited } from '../lib/step-handlers';
import { MESSAGES } from '../constants/messages';

interface UseReviewGenerationProps {
  userEmail: string;
}

export function useReviewGeneration({ userEmail }: UseReviewGenerationProps) {
  const state = useAtomValue(conversationStateAtom);
  const { setGeneratedReview, goToStep, dispatchActions } = useConversationActions();
  const { addAssistantMessage, updateMessage } = useChatMessagesJotai();

  const generateReview = useCallback(async () => {
    const msgId = addAssistantMessage('', 'text');

    try {
      const response = await fetch('/api/chat/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: state.collectedInfo,
          styleProfile: state.styleProfile,
          userEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate review');

      const fullText = await processStream(response, (text) => {
        updateMessage(msgId, { content: text, type: 'text' });
      });

      setGeneratedReview(fullText);
      goToStep('review-edit');

      updateMessage(msgId, {
        type: 'review-preview',
        content: MESSAGES.reviewEdit.complete,
        metadata: { review: fullText, characterCount: fullText.length },
      });
    } catch {
      addAssistantMessage(MESSAGES.error.unknown, 'text');
    }
  }, [state.collectedInfo, state.styleProfile, userEmail, setGeneratedReview, goToStep, addAssistantMessage, updateMessage]);

  const editReview = useCallback(
    async (request: string) => {
      const msgId = addAssistantMessage('', 'text');

      try {
        const response = await fetch('/api/chat/edit-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalReview: state.generatedReview || '',
            editRequest: request,
            styleProfile: state.styleProfile,
          }),
        });

        if (!response.ok) throw new Error('Failed to edit review');

        const fullText = await processStream(response, (text) => {
          updateMessage(msgId, { content: text, type: 'text' });
        });

        const result = handleReviewEdited(fullText, state);
        dispatchActions(result.actions);
      } catch {
        addAssistantMessage(MESSAGES.error.unknown, 'text');
      }
    },
    [state, dispatchActions, addAssistantMessage, updateMessage]
  );

  return { generateReview, editReview };
}

// Pure function for stream processing
async function processStream(
  response: Response,
  onChunk: (text: string) => void
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
