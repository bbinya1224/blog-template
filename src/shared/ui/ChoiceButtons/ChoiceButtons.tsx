'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';

interface ChoiceButtonOption {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface ChoiceButtonsProps {
  options: ChoiceButtonOption[];
  onSelect?: (optionId: string) => void;
  visibleCount?: number;
  animated?: boolean;
  className?: string;
}

export function ChoiceButtons({
  options,
  onSelect,
  visibleCount,
  animated = false,
  className,
}: ChoiceButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option, index) => {
        const visible = visibleCount === undefined || index < visibleCount;
        return (
          <Button
            variant='unstyled'
            key={option.id}
            onClick={visible ? () => onSelect?.(option.id) : undefined}
            disabled={option.disabled}
            tabIndex={visible ? undefined : -1}
            aria-hidden={!visible}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium',
              'border border-stone-200 bg-white text-stone-700',
              'hover:border-primary/50 hover:bg-surface hover:text-primary',
              'active:scale-[0.98]',
              !visible && 'pointer-events-none',
              option.icon && 'flex items-center gap-2',
              animated
                ? cn(
                    'transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    visible
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'translate-y-3 scale-95 opacity-0',
                  )
                : cn(
                    'transition-all duration-150',
                    visible ? 'opacity-100' : 'opacity-0',
                  ),
            )}
          >
            {option.icon && <span className='text-base'>{option.icon}</span>}
            <span>{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
