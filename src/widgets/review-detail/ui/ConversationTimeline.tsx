'use client';

import type { Ref } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ConversationMessage } from '@/entities/review';
import { cn } from '@/shared/lib/utils';

interface ConversationTimelineProps {
  conversation: ConversationMessage[];
  isOpen: boolean;
  onToggle: () => void;
  ref?: Ref<HTMLDivElement>;
}

export function ConversationTimeline({ conversation, isOpen, onToggle, ref }: ConversationTimelineProps) {
  if (conversation.length === 0) {
    return (
      <div ref={ref} className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="rounded-2xl bg-gradient-to-r from-stone-50 to-orange-50/30 px-5 py-4">
          <h3 className="text-sm font-semibold text-stone-700">대화 과정</h3>
        </div>
        <div className="px-5 py-8 text-center text-sm text-stone-400">
          대화 내역이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between bg-gradient-to-r from-stone-50 to-orange-50/30 px-5 py-4',
          isOpen ? 'rounded-t-2xl' : 'rounded-2xl',
        )}
      >
        <h3 className="text-sm font-semibold text-stone-700">
          대화 과정
          <span className="ml-2 text-xs font-normal text-stone-400">
            ({conversation.length}개)
          </span>
        </h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-stone-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className={cn('space-y-3 px-4 py-4', isOpen && 'overflow-y-auto sidebar-scrollbar max-h-[60vh]')}>
            {conversation.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm/relaxed',
          isUser
            ? 'bg-stone-800 text-white'
            : 'bg-stone-100 text-stone-700',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
