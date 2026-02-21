'use client';

import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '@/entities/chat-message';
import { MessageContent } from '@/entities/chat-message';
import { MessageBubble } from '@/shared/ui/MessageBubble';
import { TypingIndicator } from '@/shared/ui/TypingIndicator';

const MAX_STAGGER_INDEX = 3;
const STAGGER_DELAY_MS = 50;

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
  return (
    <div className={cn('px-5 sm:px-6', 'pt-4 pb-2', className)}>
      <div className='flex w-full flex-col'>
        <div className='space-y-6'>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              style={{
                animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * STAGGER_DELAY_MS}ms`,
              }}
            >
              {message.role === 'assistant' ? (
                <MessageContent
                  message={message}
                  enableTyping={
                    message.type === 'text' && !message.metadata?.streaming
                  }
                  onChoiceSelect={(optionId) =>
                    onChoiceSelect?.(message.id, optionId)
                  }
                  onPlaceConfirm={(confirmed) =>
                    onPlaceConfirm?.(message.id, confirmed)
                  }
                  onReviewAction={(action) =>
                    onReviewAction?.(message.id, action)
                  }
                />
              ) : (
                <p className='text-[15px]/7 whitespace-pre-wrap text-stone-800'>
                  {message.content}
                </p>
              )}
            </MessageBubble>
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </div>
    </div>
  );
}
