'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { MESSAGES } from '../constants/messages';

interface InputAreaProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InputArea({
  onSend,
  placeholder = MESSAGES.input.placeholder,
  disabled,
  className,
}: InputAreaProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount and refocus when re-enabled (after response received)
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    // Refocus after sending
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className={cn('p-4 sm:px-6', className)}>
      <div className='mx-auto w-full max-w-3xl'>
        <div
          className={cn(
            'relative flex items-end gap-2',
            'rounded-2xl bg-white',
            'border shadow-sm transition-all duration-200',
            isFocused
              ? 'border-primary/40 shadow-md shadow-primary/5'
              : 'border-stone-200',
            disabled && 'opacity-60',
          )}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent',
              'px-4 py-3',
              'text-stone-800 placeholder:text-stone-400',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              'text-[15px] leading-relaxed',
            )}
          />

          {/* Send button - Claude style arrow up */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              'mr-2 mb-2 shrink-0',
              'size-8 rounded-lg',
              'flex items-center justify-center',
              'transition-all duration-150',
              canSend
                ? 'bg-primary text-white hover:bg-primary-hover active:scale-95'
                : 'bg-stone-100 text-stone-300',
            )}
            aria-label={MESSAGES.input.sendLabel}
          >
            {/* Arrow up icon (Claude style) */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={2.5}
              strokeLinecap='round'
              strokeLinejoin='round'
              className='size-4'
            >
              <path d='M12 19V5' />
              <path d='m5 12 7-7 7 7' />
            </svg>
          </button>
        </div>
        <p className='mt-1.5 text-center text-[11px] text-stone-300'>
          {MESSAGES.input.tagline}
        </p>
      </div>
    </div>
  );
}
