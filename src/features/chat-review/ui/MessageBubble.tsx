import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '@/entities/chat-message';
import type { CSSProperties } from 'react';
import { OrotiLogo } from '@/shared/ui/Icons';
import { MessageContent } from './message-renderers';

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

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both',
        className,
      )}
      style={style}
    >
      {isAssistant ? (
        /* Claude-style: Avatar + full-width content, no bubble */
        <div className='flex items-start gap-3'>
          <OrotiLogo className='size-7 shrink-0' />
          <div className='min-w-0 flex-1 pt-0.5'>
            <MessageContent
              message={message}
              enableTyping={message.type === 'text'}
              onChoiceSelect={onChoiceSelect}
              onPlaceConfirm={onPlaceConfirm}
              onReviewAction={onReviewAction}
            />
          </div>
        </div>
      ) : (
        /* User message: right-aligned pill */
        <div className='flex justify-end'>
          <div className='max-w-[80%] rounded-2xl bg-[var(--surface)] px-4 py-2.5'>
            <p className='text-[15px] leading-7 whitespace-pre-wrap text-stone-800'>
              {message.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
