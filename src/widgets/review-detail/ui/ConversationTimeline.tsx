'use client';

import { useState } from 'react';
import type { ConversationMessage } from '@/entities/review';
import { cn } from '@/shared/lib/utils';

interface ConversationTimelineProps {
  conversation: ConversationMessage[];
}

export function ConversationTimeline({ conversation }: ConversationTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (conversation.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-stone-50 to-orange-50/30 px-5 py-4 rounded-2xl">
          <h3 className="text-sm font-semibold text-stone-700">대화 과정</h3>
        </div>
        <div className="px-5 py-8 text-center text-sm text-stone-400">
          대화 내역이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Header — mobile: toggleable, desktop: static */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between bg-gradient-to-r from-stone-50 to-orange-50/30 px-5 py-4 rounded-t-2xl md:cursor-default"
      >
        <h3 className="text-sm font-semibold text-stone-700">
          대화 과정
          <span className="ml-2 text-xs font-normal text-stone-400">
            ({conversation.length}개)
          </span>
        </h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'text-stone-400 transition-transform duration-200 md:hidden',
            isOpen && 'rotate-180',
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Desktop: always visible, scrollable */}
      <div className="hidden md:block max-h-[calc(100vh-200px)] overflow-y-auto sidebar-scrollbar px-4 py-4 space-y-3">
        {conversation.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
      </div>

      {/* Mobile: collapsible */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[60vh] overflow-y-auto sidebar-scrollbar' : 'max-h-0',
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {conversation.map((msg, i) => (
            <CompactMessage key={i} message={msg} />
          ))}
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

function CompactMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-2 text-sm">
      <span
        className={cn(
          'shrink-0 mt-0.5 text-xs font-semibold',
          isUser ? 'text-stone-500' : 'text-orange-500',
        )}
      >
        {isUser ? 'A' : 'Q'}
      </span>
      <p className="text-stone-600 line-clamp-3">{message.content}</p>
    </div>
  );
}
