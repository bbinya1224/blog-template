'use client';

import { cn } from '@/shared/lib/utils';
import type { ChoiceOption } from '@/entities/chat-message';

interface ChoiceButtonsProps {
  options: ChoiceOption[];
  onSelect?: (optionId: string) => void;
  columns?: 2 | 3;
  className?: string;
}

export function ChoiceButtons({
  options,
  onSelect,
  columns = 2,
  className,
}: ChoiceButtonsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect?.(option.id)}
          disabled={option.disabled}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium',
            'bg-white border border-stone-200 text-stone-700',
            'transition-all duration-150',
            'hover:border-[var(--primary)]/50 hover:bg-[var(--surface)] hover:text-[var(--primary)]',
            'active:scale-[0.98]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            option.icon && 'flex items-center gap-2',
          )}
        >
          {option.icon && (
            <span className='text-base'>{option.icon}</span>
          )}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
