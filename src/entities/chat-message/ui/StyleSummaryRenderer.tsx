'use client';

import { useState, useCallback } from 'react';
import { useStaggerReveal } from '@/shared/lib/hooks';
import { ChoiceButtons } from '@/shared/ui/ChoiceButtons';
import type { ChatMessage } from '../model/types';
import { isStyleSummaryMessage } from '../model/types';
import { TextRenderer } from './TextRenderer';
import { StyleSummaryCard } from './StyleSummaryCard';

const BUTTON_STAGGER_MS = 200;

interface StyleSummaryRendererProps {
  message: ChatMessage;
  enableTyping: boolean;
  onChoiceSelect?: (id: string) => void;
}

export function StyleSummaryRenderer({
  message,
  enableTyping,
  onChoiceSelect,
}: StyleSummaryRendererProps) {
  const [animationDone, setAnimationDone] = useState(!enableTyping);
  const handleAnimationComplete = useCallback(() => setAnimationDone(true), []);

  const visibleButtons = useStaggerReveal(
    message.options?.length ?? 0,
    enableTyping && animationDone,
    {
      staggerMs: BUTTON_STAGGER_MS,
      showAllWhenDisabled: !enableTyping,
    },
  );

  if (!isStyleSummaryMessage(message)) return null;

  return (
    <>
      <TextRenderer
        content={message.content || ''}
        enableTyping={enableTyping}
      />
      <StyleSummaryCard
        metadata={message.metadata}
        enableTyping={enableTyping}
        onAnimationComplete={handleAnimationComplete}
      />
      {message.options && (
        <ChoiceButtons
          options={message.options}
          onSelect={onChoiceSelect}
          visibleCount={visibleButtons}
          animated
        />
      )}
    </>
  );
}
