'use client';

import { cn } from '@/shared/lib/utils';
import type { ChoiceOption } from '../model/types';

interface ChoiceButtonsProps {
  options: ChoiceOption[];
  onSelect?: (optionId: string) => void;
  className?: string;
}

export function ChoiceButtons({
  options,
  onSelect,
  className,
}: ChoiceButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect?.(option.id)}
          disabled={option.disabled}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium',
            'border border-stone-200 bg-white text-stone-700',
            'transition-all duration-150',
            'hover:border-primary/50 hover:bg-surface hover:text-primary',
            'active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-40',
            option.icon && 'flex items-center gap-2',
          )}
        >
          {option.icon && <span className='text-base'>{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
