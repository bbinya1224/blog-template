'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '@/entities/chat-message';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onChoiceSelect?: (messageId: string, optionId: string) => void;
  onPlaceConfirm?: (messageId: string, confirmed: boolean) => void;
  onReviewAction?: (messageId: string, action: 'complete' | 'edit') => void;
  className?: string;
}

export function MessageList({
  messages,
  isTyping,
  onChoiceSelect,
  onPlaceConfirm,
  onReviewAction,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isTyping]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto',
        // Horizontal padding
        'px-5 sm:px-6',
        // Vertical spacing - reduced for tighter layout
        'pt-4 pb-2',
        // Custom scrollbar styling
        'scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent',
        className
      )}
    >
      {/* Messages container - flex-col-reverse for bottom alignment */}
      <div className="max-w-2xl mx-auto min-h-full flex flex-col justify-end">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onChoiceSelect={(optionId) => onChoiceSelect?.(message.id, optionId)}
              onPlaceConfirm={(confirmed) => onPlaceConfirm?.(message.id, confirmed)}
              onReviewAction={(action) => onReviewAction?.(message.id, action)}
              style={{
                animationDelay: `${Math.min(index, 3) * 50}ms`,
              }}
            />
          ))}

          {isTyping && (
            <TypingIndicator />
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
