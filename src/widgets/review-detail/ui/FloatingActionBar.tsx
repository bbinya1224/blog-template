'use client';

import { Copy, Check, Pencil, MessageCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FloatingActionBarProps {
  onCopy: () => void;
  isCopying: boolean;
  onEditClick: () => void;
  onConversationClick: () => void;
  conversationCount: number;
  isEditPanelOpen: boolean;
}

export function FloatingActionBar({
  onCopy,
  isCopying,
  onEditClick,
  onConversationClick,
  conversationCount,
  isEditPanelOpen,
}: FloatingActionBarProps) {
  if (isEditPanelOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 animate-fade-in-up">
      <div className="flex items-center gap-1 rounded-full bg-stone-900 px-2 py-2 shadow-lg">
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white',
            isCopying && 'text-green-400',
          )}
          aria-label="리뷰 복사"
        >
          {isCopying ? <Check size={16} /> : <Copy size={16} />}
        </button>

        <div className="h-5 w-px bg-white/20" />

        <button
          type="button"
          onClick={onEditClick}
          className="rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="AI 수정"
        >
          <Pencil size={16} />
        </button>

        {conversationCount > 0 && (
          <>
            <div className="h-5 w-px bg-white/20" />
            <button
              type="button"
              onClick={onConversationClick}
              className="rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="대화 과정"
            >
              <MessageCircle size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
