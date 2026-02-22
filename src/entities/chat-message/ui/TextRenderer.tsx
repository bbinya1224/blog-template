'use client';

import { cn } from '@/shared/lib/utils';
import { useTypingEffect, useStreamingText } from '@/shared/lib/hooks';

interface TextRendererProps {
  content: string;
  enableTyping?: boolean;
  isStreaming?: boolean;
}

export function TextRenderer({
  content,
  enableTyping = false,
  isStreaming = false,
}: TextRendererProps) {
  const { displayedText: typedText, isTyping } = useTypingEffect(
    content,
    enableTyping,
  );
  const { displayedText: streamedText, isAnimating } = useStreamingText(
    content,
    isStreaming,
  );

  const displayedText = isStreaming
    ? streamedText
    : enableTyping
      ? typedText
      : content;
  const showCursor = isStreaming ? isAnimating : isTyping;

  if (!content) return null;

  return (
    <p className='text-[15px]/7 break-keep whitespace-pre-wrap text-stone-700'>
      {displayedText}
      <span
        aria-hidden
        className={cn(
          'inline-block h-[1em] w-0.5 translate-y-[0.1em] bg-stone-400 transition-opacity duration-300',
          showCursor ? 'animate-pulse opacity-100' : 'opacity-0',
        )}
      />
    </p>
  );
}
