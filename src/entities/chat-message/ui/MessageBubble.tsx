import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '../model/types';
import type { CSSProperties } from 'react';
import { OrotiLogo } from '@/shared/ui/Icons';
import { MessageContent } from './MessageRenderers';

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
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300 ease-out',
        className,
      )}
      style={style}
    >
      {isAssistant ? (
        <div className='flex w-fit items-start gap-3'>
          <OrotiLogo className='size-7 shrink-0' />
          <div className='flex-1 rounded-2xl bg-white p-3'>
            <MessageContent
              message={message}
              enableTyping={
                message.type === 'text' && !message.metadata?.streaming
              }
              onChoiceSelect={onChoiceSelect}
              onPlaceConfirm={onPlaceConfirm}
              onReviewAction={onReviewAction}
            />
          </div>
        </div>
      ) : (
        /* User message: right-aligned pill */
        <div className='flex justify-end'>
          <div className='max-w-[80%] rounded-2xl bg-surface px-4 py-2.5'>
            <p className='text-[15px]/7 whitespace-pre-wrap text-stone-800'>
              {message.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
