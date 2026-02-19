'use client';

import { cn } from '@/shared/lib/utils';
import { OrotiLogo } from '@/shared/ui/Icons';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        'animate-in fade-in duration-200',
        className,
      )}
    >
      <OrotiLogo className='size-7 shrink-0' />

      {/* Dots */}
      <div className='flex items-center gap-1.5 pt-2'>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className='size-1.5 animate-bounce rounded-full bg-stone-400'
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
