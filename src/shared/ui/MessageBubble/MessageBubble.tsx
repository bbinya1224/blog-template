'use client';

import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { OrotiLogo } from '@/shared/ui/Icons';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function MessageBubble({
  role,
  children,
  className,
  style,
}: MessageBubbleProps) {
  const isAssistant = role === 'assistant';

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
            {children}
          </div>
        </div>
      ) : (
        <div className='flex justify-end'>
          <div className='max-w-[80%] rounded-2xl bg-surface px-4 py-2.5'>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
