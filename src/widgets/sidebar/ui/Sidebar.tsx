'use client';

import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { cn } from '@/shared/lib/utils';
import { resetConversationAtom } from '@/features/chat-review/model/atoms';
import { useSidebar } from '../model/sidebar-context';
import { SidebarReviewList } from './SidebarReviewList';
import { SidebarUserProfile } from './SidebarUserProfile';

function getIsDesktop() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 768px)').matches;
}

function OrotiIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="size-8  shrink-0">
      <circle cx="16" cy="16" r="14" fill="#E8825C" />
      <circle cx="16" cy="16" r="9" fill="#FFFBF7" />
      <circle cx="16" cy="16" r="5" fill="#F4A261" />
    </svg>
  );
}

export function Sidebar() {
  const { isExpanded, showLabels, toggle, collapse } = useSidebar();
  const router = useRouter();
  const resetConversation = useSetAtom(resetConversationAtom);

  const handleNewRecord = () => {
    router.push('/');
    resetConversation();
    if (!getIsDesktop()) collapse();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={collapse}
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-white border-r border-stone-200 h-full z-50 overflow-hidden',
          'transition-[width] duration-300 ease-in-out shrink-0',
          isExpanded ? 'w-64' : 'w-16',
          // Mobile: fixed overlay when expanded
          isExpanded
            ? 'fixed left-0 top-0 md:relative'
            : 'relative'
        )}
      >
        {/* Top: Brand + Toggle */}
        <div className="flex items-center border-b border-stone-100 h-14 shrink-0">
          <button onClick={toggle} className="w-16 shrink-0 flex justify-center hover:opacity-80 transition-opacity">
            <OrotiIcon />
          </button>
          {showLabels && (
            <>
              <span className="text-base font-bold tracking-tight text-stone-800 whitespace-nowrap">
                오롯이
              </span>
              <div className="flex-1" />
              <button
                onClick={toggle}
                className="p-1.5 mr-3 rounded-lg hover:bg-stone-100 transition-colors text-stone-400"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* New Record Button */}
        <div className="shrink-0 border-b border-stone-100">
          <button
            onClick={handleNewRecord}
            className="flex items-center w-full hover:bg-stone-100 transition-colors py-2.5"
            title="새 기록 남기기"
          >
            <div className="w-16 shrink-0 flex justify-center">
              <svg className="size-5 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            {showLabels && (
              <span className="text-sm font-medium text-stone-700 whitespace-nowrap">
                새 기록 남기기
              </span>
            )}
          </button>
        </div>

        {/* Review List (scrollable) */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar min-h-0">
          {showLabels && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                보관함
              </p>
            </div>
          )}
          <SidebarReviewList />
        </div>

        {/* Bottom: User Profile */}
        <div className="shrink-0 border-t border-stone-100">
          <SidebarUserProfile />
        </div>
      </aside>
    </>
  );
}
