'use client';

import { cn } from '@/shared/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in duration-200',
        className
      )}
    >
      <div className="flex items-center gap-1 py-1">
        <span
          className="size-1.5  bg-stone-400 rounded-full animate-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="size-1.5  bg-stone-400 rounded-full animate-pulse"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="size-1.5  bg-stone-400 rounded-full animate-pulse"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
}
