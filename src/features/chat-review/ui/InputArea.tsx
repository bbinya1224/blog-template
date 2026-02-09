'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface InputAreaProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InputArea({
  onSend,
  placeholder = '메시지를 입력해주세요...',
  disabled,
  className,
}: InputAreaProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
    <div className={cn('px-4 py-8 sm:px-6', className)}>
      <div className='w-full'>
        <div
          className={cn(
            'relative flex items-end gap-2',
            'rounded-xl bg-stone-50',
            'border transition-all duration-200',
            isFocused ? 'border-stone-300 bg-white' : 'border-stone-200',
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

          {/* Send button - only visible when there's content */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              'mr-2 mb-2 shrink-0',
              'size-8 rounded-lg',
              'flex items-center justify-center',
              'transition-all duration-150',
              canSend
                ? 'bg-stone-800 text-white hover:bg-stone-700 active:scale-95'
                : 'bg-transparent text-stone-300',
            )}
            aria-label='메시지 전송'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-4'
            >
              <path d='M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
