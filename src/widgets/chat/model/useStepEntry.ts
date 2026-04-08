'use client';

import { useEffect, useRef } from 'react';
import {
  useChatStore,
  FLOW_GRAPH,
  MESSAGES,
} from '@/features/chat-review';
import type { FlowEnterContext } from '@/features/chat-review';
import type { ConversationStep } from '@/features/chat-review';

interface UseStepEntryParams {
  generateReview: () => Promise<void>;
}

export function useStepEntry({
  generateReview,
}: UseStepEntryParams) {
  const isInitializedRef = useRef(false);
  const prevStepRef = useRef<ConversationStep | null>(null);
  const onEnterTokenRef = useRef(0);

  const messages = useChatStore((s) => s.messages);
  const step = useChatStore((s) => s.step);
  const orchestrationState = useChatStore((s) => s);
  const addMessage = useChatStore((s) => s.addMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);

  useEffect(() => {
    const isWelcomeState = messages.length === 0 && step === 'style-check';

    if (isWelcomeState) {
      isInitializedRef.current = false;
      prevStepRef.current = null;
      onEnterTokenRef.current += 1;
      return;
    }

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      onEnterTokenRef.current += 1;
    }

    if (step === prevStepRef.current) return;
    prevStepRef.current = step;

    const node = FLOW_GRAPH[step];
    if (!node?.onEnter) return;

    const stepAtEntry = step;
    const tokenAtEntry = ++onEnterTokenRef.current;

    const isStale = () =>
      useChatStore.getState().step !== stepAtEntry ||
      onEnterTokenRef.current !== tokenAtEntry;

    const ctx: FlowEnterContext = {
      state: orchestrationState,
      generateReview: async () => {
        if (isStale()) return;
        await generateReview();
      },
    };

    const applyResult = (result: { messages: Parameters<typeof addMessage>[0][] }) => {
      if (isStale()) return;
      result.messages.forEach((msg) => {
        addMessage(msg);
      });
    };

    try {
      const result = node.onEnter(ctx);
      if (result instanceof Promise) {
        result.then(applyResult).catch((error) => {
          if (isStale()) return;
          console.error('[useStepEntry] onEnter 에러:', error);
          addAssistantMessage(MESSAGES.error.unknown, 'text');
        });
      } else {
        applyResult(result);
      }
    } catch (error) {
      if (isStale()) return;
      console.error('[useStepEntry] onEnter 에러:', error);
      addAssistantMessage(MESSAGES.error.unknown, 'text');
    }
  }, [
    messages.length,
    step,
    orchestrationState,
    addMessage,
    addAssistantMessage,
    generateReview,
  ]);

  return { isInitializedRef };
}
