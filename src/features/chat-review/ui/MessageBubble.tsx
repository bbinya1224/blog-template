'use client';

import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '@/entities/chat-message';
import type { CSSProperties } from 'react';
import { MessageContent } from './message-renderers';

const BUBBLE_STYLES = {
  assistant: 'max-w-[85%] sm:max-w-[75%] bg-white rounded-3xl p-5',
  user: 'max-w-[85%] sm:max-w-[75%] bg-stone-100 px-4 py-2.5 rounded-2xl',
} as const;

interface MessageBubbleProps {
  message: ChatMessage;
  onChoiceSelect?: (optionId: string) => void;
  onPlaceConfirm?: (confirmed: boolean) => void;
  onReviewAction?: (action: 'complete' | 'edit') => void;
  className?: string;
  style?: CSSProperties;
}

export function MessageBubble({
  message,
  onChoiceSelect,
  onPlaceConfirm,
  onReviewAction,
  className,
  style,
}: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const bubbleStyle = isAssistant ? BUBBLE_STYLES.assistant : BUBBLE_STYLES.user;

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both',
        className,
      )}
      style={style}
    >
      <div className={cn('flex', isAssistant ? 'justify-start' : 'justify-end')}>
        <div className={bubbleStyle}>
          {isAssistant ? (
            <MessageContent
              message={message}
              enableTyping={message.type === 'text'}
              onChoiceSelect={onChoiceSelect}
              onPlaceConfirm={onPlaceConfirm}
              onReviewAction={onReviewAction}
            />
          ) : (
            <p className="text-stone-800 leading-7 whitespace-pre-wrap text-[15px]">
              {message.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
